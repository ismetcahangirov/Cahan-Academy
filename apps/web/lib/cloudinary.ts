let scriptLoaded = false;
let scriptPromise: Promise<void> | null = null;

export function getCloudinaryScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (scriptLoaded) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://upload-widget.cloudinary.com/global/all.js';
    script.onload = () => {
      scriptLoaded = true;
      resolve();
    };
    script.onerror = () => {
      scriptPromise = null;
      resolve();
    };
    document.head.appendChild(script);
  });

  return scriptPromise;
}

declare global {
  interface Window {
    cloudinary: {
      createUploadWidget: (
        options: Record<string, unknown>,
        callback: (error: unknown, result: { event: string; info?: { secure_url: string } }) => void
      ) => {
        open: () => void;
        close: () => void;
        destroy: () => void;
      };
    };
  }
}
