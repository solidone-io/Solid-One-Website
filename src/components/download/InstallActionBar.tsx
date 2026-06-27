import { useCallback, useEffect, useState } from "react";
import { Download, ExternalLink, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { GoogleSignInButton } from "@/components/download/GoogleSignInButton";
import { DOWNLOAD_APP } from "@/content/download-app";
import {
  clearLocalInstallState,
  formatBytes,
  getLocalInstallState,
  isAndroidDevice,
  openAndroidApp,
  openAndroidUninstall,
  openApkDownload,
  probeAndroidAppInstalled,
  setLocalInstallState,
} from "@/lib/apk-client";
import { apiUrl } from "@/lib/api-base";
import {
  fetchDownloadRelease,
  recordDownloadInstall,
  recordDownloadInstallKeepalive,
  type ApkRelease,
  type DownloadStats,
} from "@/lib/download-api";
import { clearDownloadAuth, getDownloadAuth } from "@/lib/download-auth";
import { useToast } from "@/hooks/use-toast";

type InstallPhase = "idle" | "downloading";

function DownloadInProgressPanel({
  release,
  isUpdate,
  onDone,
}: {
  release: ApkRelease;
  isUpdate: boolean;
  onDone: () => void;
}) {
  const [pulse, setPulse] = useState(12);

  useEffect(() => {
    const id = window.setInterval(() => {
      setPulse((v) => (v >= 88 ? 18 : v + 7));
    }, 450);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mt-6 space-y-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-5">
      <div className="flex items-center gap-2 text-emerald-300">
        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
        <span className="text-[14px] font-medium">
          {isUpdate ? "Update downloading…" : "Download in progress…"}
        </span>
      </div>

      <Progress value={pulse} className="h-2 bg-white/10 [&>div]:bg-emerald-400" />

      <div className="space-y-1.5 text-[12px] text-white/50 leading-relaxed">
        {isAndroidDevice() ? (
          <>
            <p>Chrome is downloading the APK (~{formatBytes(release.size)}). Progress appears in Chrome, not on this page.</p>
            <p>
              <span className="text-white/70">Where to look:</span> pull down the notification shade, or tap Chrome&apos;s
              menu (⋮) → <span className="text-white/70">Downloads</span>.
            </p>
            <p>When the download finishes, tap the file and choose Install.</p>
          </>
        ) : (
          <p>Your browser is downloading the APK. Check your downloads folder, then transfer it to your Android phone.</p>
        )}
      </div>

      <Button
        variant="outline"
        className="w-full h-10 rounded-full border-white/15 text-white/80 hover:bg-white/5"
        onClick={onDone}
      >
        Back to download page
      </Button>
    </div>
  );
}

type InstallActionBarProps = {
  onStatsChange?: (stats: DownloadStats) => void;
};

export function InstallActionBar({ onStatsChange }: InstallActionBarProps) {
  const { toast } = useToast();
  const [authed, setAuthed] = useState(() => Boolean(getDownloadAuth()));
  const [release, setRelease] = useState<ApkRelease | null>(null);
  const [installed, setInstalled] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [phase, setPhase] = useState<InstallPhase>("idle");
  const [downloadIsUpdate, setDownloadIsUpdate] = useState(false);

  const syncAuth = useCallback(() => setAuthed(Boolean(getDownloadAuth())), []);

  const refreshReleaseState = useCallback(async () => {
    try {
      const r = await fetchDownloadRelease();
      setRelease(r);

      const local = getLocalInstallState();
      const onDevice = await probeAndroidAppInstalled(r.packageName);
      const isInstalled = onDevice && Boolean(local);
      setInstalled(isInstalled);
      setUpdateAvailable(isInstalled && local != null && local.versionCode < r.versionCode);
    } catch {
      setRelease(null);
    }
  }, []);

  useEffect(() => {
    syncAuth();
    refreshReleaseState().catch(() => {});
    window.addEventListener("solid-one-download-auth", syncAuth);
    const id = window.setInterval(() => refreshReleaseState().catch(() => {}), 12000);
    return () => {
      window.removeEventListener("solid-one-download-auth", syncAuth);
      clearInterval(id);
    };
  }, [refreshReleaseState, syncAuth]);

  const runDownload = (isUpdate: boolean) => {
    const auth = getDownloadAuth();
    if (!auth || !release) return;

    const version = {
      versionCode: release.versionCode,
      versionName: release.versionName,
    };

    setDownloadIsUpdate(isUpdate);
    setPhase("downloading");

    // Record on server (keepalive survives Android navigation) + retry in background.
    recordDownloadInstallKeepalive(version);
    void recordDownloadInstall(version)
      .then((result) => onStatsChange?.(result.stats))
      .catch(() => {
        /* download still proceeds — admin may update on retry/keepalive */
      });

    setLocalInstallState(version);

    const apkUrl = `${apiUrl(release.downloadPath)}?v=${encodeURIComponent(release.versionName)}`;
    openApkDownload(apkUrl, release.fileName);

    toast({
      title: isUpdate ? "Update started" : "Download started",
      description: isAndroidDevice()
        ? "Check Chrome notifications or Downloads for progress."
        : "Open the downloaded APK on your Android device to install.",
    });
  };

  const handleUninstall = () => {
    if (!isAndroidDevice()) {
      toast({
        title: "Uninstall on your phone",
        description: "On Android: Settings → Apps → Solid One → Uninstall.",
      });
      return;
    }
    clearLocalInstallState();
    setInstalled(false);
    setUpdateAvailable(false);
    openAndroidUninstall(DOWNLOAD_APP.androidPackage);
    toast({
      title: "Opening app settings",
      description: "Tap Uninstall on the next screen, then return here to install again.",
    });
    window.setTimeout(() => refreshReleaseState().catch(() => {}), 3000);
  };

  const handleOpen = () => {
    if (!isAndroidDevice()) {
      toast({ title: "Open on Android", description: "Install the app on your Android device first." });
      return;
    }
    openAndroidApp(DOWNLOAD_APP.androidPackage);
  };

  const auth = getDownloadAuth();

  if (!authed) {
    return (
      <div className="mt-6 space-y-4">
        <div className="rounded-2xl border border-white/10 bg-[#0a0a0a]/80 p-5">
          <p className="text-[15px] font-semibold text-center mb-1">Sign in to install</p>
          <p className="text-[13px] text-white/55 text-center mb-4">
            Sign in with Google to download Solid One on your Android device.
          </p>
          <GoogleSignInButton onSignedIn={syncAuth} />
        </div>
        {release && (
          <p className="text-[11px] text-white/35 text-center">
            v{release.versionName} · {formatBytes(release.size)} · Android
          </p>
        )}
      </div>
    );
  }

  if (phase === "downloading" && release) {
    return (
      <DownloadInProgressPanel
        release={release}
        isUpdate={downloadIsUpdate}
        onDone={() => setPhase("idle")}
      />
    );
  }

  if (installed && !updateAvailable) {
    return (
      <div className="mt-6 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            className="flex-1 h-12 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-[15px]"
            onClick={handleOpen}
          >
            <ExternalLink className="h-5 w-5 mr-2" />
            Open
          </Button>
          <Button
            variant="outline"
            className="flex-1 h-12 rounded-full border-white/15 text-white/80 hover:bg-white/5 font-semibold text-[15px]"
            onClick={handleUninstall}
          >
            <Trash2 className="h-5 w-5 mr-2" />
            Uninstall
          </Button>
        </div>
        {release && (
          <p className="text-[11px] text-white/35 text-center">
            Installed v{getLocalInstallState()?.versionName ?? release.versionName}
          </p>
        )}
      </div>
    );
  }

  if (installed && updateAvailable) {
    return (
      <div className="mt-6 space-y-3">
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-[13px] text-amber-100/90">
          Update available — v{release?.versionName}. If install fails, uninstall the current app first, then install
          the new APK.
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            className="flex-1 h-12 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-[15px]"
            onClick={() => runDownload(true)}
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Update
          </Button>
          <Button
            variant="outline"
            className="flex-1 h-12 rounded-full border-white/15 text-white/80 hover:bg-white/5 font-semibold text-[15px]"
            onClick={handleUninstall}
          >
            <Trash2 className="h-5 w-5 mr-2" />
            Uninstall first
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      <Button
        className="w-full h-12 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-[15px]"
        onClick={() => runDownload(false)}
        disabled={!release}
      >
        <Download className="h-5 w-5 mr-2" />
        Install
      </Button>

      {release && (
        <p className="text-[11px] text-white/35 text-center">
          v{release.versionName} · {formatBytes(release.size)} · Android
        </p>
      )}

      {auth && (
        <p className="text-[12px] text-white/35 text-center">
          Signed in as {auth.user.name}
          <button type="button" className="ml-2 underline hover:text-white/60" onClick={() => clearDownloadAuth()}>
            Sign out
          </button>
        </p>
      )}
    </div>
  );
}
