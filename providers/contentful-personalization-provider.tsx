"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  type NinetailedProviderInstantiationProps,
  NinetailedProvider,
  useNinetailed,
  useProfile,
} from "@ninetailed/experience.js-react";

import type { AnalyticsEvent } from "@/analytics/events";
import {
  buildPersonalizationTraits,
  defaultPersonalizationState,
  enrichAnalyticsPayload,
  getPersonalizationAudienceKeyFromProfile,
  isPersonalizationAudienceKey,
  isPersonalizationOverrideAllowed,
  PERSONALIZATION_DEBUG_COOKIE,
  readPersonalizationState,
  reducePersonalizationState,
  writePersonalizationState,
  type PersonalizationState,
} from "@/lib/contentful/personalization";
import { env, hasContentfulPersonalizationConfig } from "@/lib/env";
import type {
  PersonalizationAudienceKey,
  PersonalizationTraits,
} from "@/types/domain";

interface ContentfulPersonalizationContextValue {
  enabled: boolean;
  loading: boolean;
  audienceIds: string[];
  activeAudienceKey?: PersonalizationAudienceKey;
  debugAudienceOverride?: PersonalizationAudienceKey;
  audienceOverrideActive: boolean;
  profileId?: string;
  traits: PersonalizationTraits;
  trackContentfulEvent: (event: AnalyticsEvent, pathname: string, search: URLSearchParams | null) => void;
  setDebugAudienceOverride: (value?: PersonalizationAudienceKey) => void;
}

const ContentfulPersonalizationContext =
  createContext<ContentfulPersonalizationContextValue>({
    enabled: false,
    loading: false,
    audienceIds: [],
    audienceOverrideActive: false,
    traits: defaultPersonalizationState,
    trackContentfulEvent() {
      return;
    },
    setDebugAudienceOverride() {
      return;
    },
  });

function isClientDebugEnabled() {
  if (typeof window === "undefined") {
    return false;
  }

  const params = new URLSearchParams(window.location.search);
  return params.get("nt_debug") === "1" || params.get("nt_debug") === "true";
}

function PersonalizationDisabledDebugReporter() {
  useEffect(() => {
    if (!isClientDebugEnabled()) {
      return;
    }

    console.warn("[personalization] provider disabled", {
      enabledFlag: env.nextPublicContentfulPersonalizationEnabled,
      hasClientId: Boolean(env.nextPublicContentfulPersonalizationClientId),
      clientIdLength: env.nextPublicContentfulPersonalizationClientId.length,
      environment: env.nextPublicContentfulPersonalizationEnvironment,
      apiUrl: env.nextPublicContentfulPersonalizationApiUrl || "(default)",
    });
  }, []);

  return null;
}

function setDebugAudienceCookie(value?: PersonalizationAudienceKey) {
  if (typeof document === "undefined") {
    return;
  }

  if (!value) {
    document.cookie = `${PERSONALIZATION_DEBUG_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
    return;
  }

  document.cookie = `${PERSONALIZATION_DEBUG_COOKIE}=${value}; Path=/; Max-Age=${60 * 60 * 12}; SameSite=Lax`;
}

function getDebugAudienceCookie() {
  if (typeof document === "undefined") {
    return undefined;
  }

  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${PERSONALIZATION_DEBUG_COOKIE}=`));

  const value = match?.split("=")[1];

  return isPersonalizationAudienceKey(value) ? value : undefined;
}

function ContentfulPersonalizationRuntime({
  children,
  previewEnabled,
}: {
  children: React.ReactNode;
  previewEnabled: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ninetailed = useNinetailed();
  const profile = useProfile();
  const [state, setState] = useState<PersonalizationState>(defaultPersonalizationState);
  const [debugAudienceOverride, setDebugAudienceOverrideState] = useState<
    PersonalizationAudienceKey | undefined
  >(undefined);
  const previousPageKey = useRef<string | null>(null);

  const allowOverride = isPersonalizationOverrideAllowed(previewEnabled);
  const profileData = profile.profile;
  const debugModeEnabled =
    searchParams?.get("nt_debug") === "1" || searchParams?.get("nt_debug") === "true";

  useEffect(() => {
    setState(readPersonalizationState());
    setDebugAudienceOverrideState(getDebugAudienceCookie());
  }, []);

  useEffect(() => {
    if (!allowOverride) {
      if (debugAudienceOverride) {
        setDebugAudienceOverrideState(undefined);
        setDebugAudienceCookie(undefined);
      }

      return;
    }

    const overrideFromQuery = searchParams?.get("nt_debug_audience");

    if (isPersonalizationAudienceKey(overrideFromQuery)) {
      setDebugAudienceOverrideState(overrideFromQuery);
      setDebugAudienceCookie(overrideFromQuery);
      return;
    }

    if (overrideFromQuery === "clear") {
      setDebugAudienceOverrideState(undefined);
      setDebugAudienceCookie(undefined);
    }
  }, [allowOverride, debugAudienceOverride, searchParams]);

  useEffect(() => {
    void ninetailed.debug(debugModeEnabled);
  }, [debugModeEnabled, ninetailed]);

  const traits = useMemo(
    () =>
      buildPersonalizationTraits(state, {
        isReturningVisitor:
          profileData?.session.isReturningVisitor ?? state.isReturningVisitor,
      }),
    [profileData?.session.isReturningVisitor, state],
  );

  const activeAudienceKey = getPersonalizationAudienceKeyFromProfile(
    profileData?.audiences ?? [],
    allowOverride ? debugAudienceOverride : undefined,
  );

  useEffect(() => {
    const currentPath = searchParams?.size
      ? `${pathname}?${searchParams.toString()}`
      : pathname;

    if (!currentPath || previousPageKey.current === currentPath) {
      return;
    }

    previousPageKey.current = currentPath;

    const payload = enrichAnalyticsPayload(
      "page_view",
      {},
      pathname,
      searchParams,
      traits,
      {
        audienceKey: activeAudienceKey,
        audienceOverrideActive: Boolean(allowOverride && debugAudienceOverride),
      },
    );

    if (debugModeEnabled) {
      console.info("[personalization] page_view", {
        pathname,
        currentPath,
        payload,
        activeAudienceKey,
        profileId: profileData?.stableId,
      });
    }

    void ninetailed.page({
      path: pathname,
      properties: payload,
    });
    setState((currentState) => {
      const nextState = reducePersonalizationState(currentState, {
        name: "page_view",
        payload,
      });
      writePersonalizationState(nextState);
      return nextState;
    });
  }, [
    activeAudienceKey,
    allowOverride,
    debugAudienceOverride,
    ninetailed,
    pathname,
    searchParams,
    traits,
  ]);

  useEffect(() => {
    if (!debugModeEnabled) {
      return;
    }

    console.info("[personalization] profile", {
      loading: profile.loading,
      profileId: profileData?.stableId,
      audiences: profileData?.audiences ?? [],
      previewEnabled,
      debugAudienceOverride,
      activeAudienceKey,
      traits,
    });
  }, [
    activeAudienceKey,
    debugAudienceOverride,
    debugModeEnabled,
    previewEnabled,
    profile.loading,
    profileData?.audiences,
    profileData?.stableId,
    traits,
  ]);

  function trackContentfulEvent(
    event: AnalyticsEvent,
    currentPathname: string,
    currentSearchParams: URLSearchParams | null,
  ) {
    const payload = enrichAnalyticsPayload(
      event.name,
      event.payload ?? {},
      currentPathname,
      currentSearchParams,
      traits,
      {
        audienceKey: activeAudienceKey,
        audienceOverrideActive: Boolean(allowOverride && debugAudienceOverride),
      },
    );

    void ninetailed.track(event.name, payload);
    setState((currentState) => {
      const nextState = reducePersonalizationState(currentState, {
        name: event.name,
        payload,
      });
      writePersonalizationState(nextState);
      return nextState;
    });
  }

  function setDebugAudienceOverride(value?: PersonalizationAudienceKey) {
    if (!allowOverride) {
      return;
    }

    setDebugAudienceOverrideState(value);
    setDebugAudienceCookie(value);
  }

  return (
    <ContentfulPersonalizationContext.Provider
      value={{
        enabled: true,
        loading: profile.loading,
        audienceIds: profileData?.audiences ?? [],
        activeAudienceKey,
        debugAudienceOverride,
        audienceOverrideActive: Boolean(allowOverride && debugAudienceOverride),
        profileId: profileData?.stableId,
        traits,
        trackContentfulEvent,
        setDebugAudienceOverride,
      }}
    >
      {children}
    </ContentfulPersonalizationContext.Provider>
  );
}

export function ContentfulPersonalizationProvider({
  children,
  previewEnabled,
}: {
  children: React.ReactNode;
  previewEnabled: boolean;
}) {
  if (!hasContentfulPersonalizationConfig()) {
    return (
      <ContentfulPersonalizationContext.Provider
        value={{
          enabled: false,
          loading: false,
          audienceIds: [],
          audienceOverrideActive: false,
          traits: defaultPersonalizationState,
          trackContentfulEvent() {
            return;
          },
          setDebugAudienceOverride() {
            return;
          },
        }}
      >
        <PersonalizationDisabledDebugReporter />
        {children}
      </ContentfulPersonalizationContext.Provider>
    );
  }

  const providerProps: NinetailedProviderInstantiationProps = {
    clientId: env.nextPublicContentfulPersonalizationClientId,
    environment: env.nextPublicContentfulPersonalizationEnvironment,
    preview: previewEnabled,
    url: env.nextPublicContentfulPersonalizationApiUrl || undefined,
    useSDKEvaluation: true,
    onLog(message: unknown, ...args: unknown[]) {
      if (typeof window === "undefined") {
        return;
      }

      if (isClientDebugEnabled()) {
        console.info("[ninetailed]", message, ...args);
      }
    },
    onError(message: string | Error, ...args: unknown[]) {
      if (typeof window === "undefined") {
        return;
      }

      if (isClientDebugEnabled()) {
        console.error("[ninetailed]", message, ...args);
      }
    },
  };

  if (isClientDebugEnabled()) {
    console.info("[personalization] provider enabled", {
      environment: env.nextPublicContentfulPersonalizationEnvironment,
      hasClientId: Boolean(env.nextPublicContentfulPersonalizationClientId),
      clientIdLength: env.nextPublicContentfulPersonalizationClientId.length,
      apiUrl: env.nextPublicContentfulPersonalizationApiUrl || "(default)",
    });
  }

  return (
    <NinetailedProvider {...providerProps}>
      <ContentfulPersonalizationRuntime previewEnabled={previewEnabled}>
        {children}
      </ContentfulPersonalizationRuntime>
    </NinetailedProvider>
  );
}

export function useContentfulPersonalization() {
  return useContext(ContentfulPersonalizationContext);
}
