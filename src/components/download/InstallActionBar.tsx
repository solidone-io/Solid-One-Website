import { useCallback, useEffect, useState } from "react";
import { Download, ExternalLink, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { GoogleSignInButton } from "@/components/download/GoogleSignInButton";
import { DOWNLOAD_APP } from "@/content/download-app";
import {
  clearLocalInstallState,
  downloadApkWithProgress,
  formatBytes,
  getLocalInstallState,
  isAndroidDevice,
  openAndroidApp,
  openAndroidUninstall,
  openApkDownload,
  probeAndroidAppInstalled,
  setLocalInstallState,
  triggerApkSave,
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

type InstallPhase = "idle" | "downloading" | "installing" | "error";

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
  const [progress, setProgress] = useState(0);
  const [loadedBytes, setLoadedBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);
  const [error, setError] = useState<string | null>(null);

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

  const runDownload = async (isUpdate: boolean) => {
    const auth = getDownloadAuth();
    if (!auth || !release) return;

    const version = {
      versionCode: release.versionCode,
      versionName: release.versionName,
    };

    setPhase("downloading");
    setProgress(0);
    setLoadedBytes(0);
    setTotalBytes(release.size);
    setError(null);

    recordDownloadInstallKeepalive(version);

    const apkUrl = `${apiUrl(release.downloadPath)}?v=${encodeURIComponent(release.versionName)}`;

    try {
      const { blob, versionCode, versionName } = await downloadApkWithProgress(
        apkUrl,
        (pct, loaded, total) => {
          setProgress(pct);
          setLoadedBytes(loaded);
          if (total > 0) setTotalBytes(total);
        },
        version,
      );

      setPhase("installing");

      try {
        triggerApkSave(blob, release.fileName);
      } catch {
        openApkDownload(apkUrl, release.fileName);
      }

      const savedVersion = {
        versionCode: versionCode || release.versionCode,
        versionName: versionName || release.versionName,
      };
      setLocalInstallState(savedVersion);

      void recordDownloadInstall(savedVersion)
        .then((result) => onStatsChange?.(result.stats))
        .catch(() => {
          /* install record retried via keepalive */
        });

      if (isUpdate) {
        toast({
          title: "Update downloaded",
          description: "Open the APK from Downloads to update. If install fails, uninstall the old app first.",
        });
      } else {
        toast({
          title: "Download complete",
          description: isAndroidDevice()
            ? "Open your Downloads folder and tap the APK to install."
            : "Transfer the APK to your Android phone to install.",
        });
      }

      await refreshReleaseState();
      setPhase("idle");
    } catch (err) {
      setPhase("error");
      setError(err instanceof Error ? err.message : "Download failed.");
      toast({
        title: "Download failed",
        description: err instanceof Error ? err.message : "Try again.",
        variant: "destructive",
      });
    }
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

  if (phase === "downloading" || phase === "installing") {
    return (
      <div className="mt-6 space-y-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-5">
        <div className="flex items-center gap-2 text-emerald-300">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-[14px] font-medium">
            {phase === "downloading" ? "Downloading…" : "Preparing install…"}
          </span>
        </div>
        <Progress value={progress} className="h-2 bg-white/10" />
        <p className="text-[12px] text-white/45 tabular-nums">
          {progress}% · {formatBytes(loadedBytes)}
          {totalBytes > 0 ? ` / ${formatBytes(totalBytes)}` : ""}
        </p>
      </div>
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
        <p className="text-[13px] text-white/55 text-center">
          Update available — v{release?.versionName}. If install fails, uninstall the current app first, then install
          the new APK.
        </p>
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
        disabled={!release || phase === "error"}
      >
        <Download className="h-5 w-5 mr-2" />
        Install
      </Button>

      {release && (
        <p className="text-[11px] text-white/35 text-center">
          v{release.versionName} · {formatBytes(release.size)} · Android
        </p>
      )}

      {error && <p className="text-[12px] text-red-400/90 text-center">{error}</p>}

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
