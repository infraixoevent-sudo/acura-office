"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

// Espejo de ModalShare.razor + QRCodeService.cs: mismo link (`checkout/detail?Name=`)
// y mismas opciones de QR (ECC nivel Q, 600px tanto en vista como en descarga —
// el Blazor usa el mismo tamaño para ambas, solo el nombre del archivo cambia).
const QR_OPTIONS = { errorCorrectionLevel: "Q" as const, width: 600, margin: 1 };

interface Props {
  show: boolean;
  idEvent: number;
  nameEvent: string;
  baseUrl: string;
  onClose: () => void;
}

export function ShareEventModal({ show, idEvent, nameEvent, baseUrl, onClose }: Props) {
  const [qrCodeImage, setQrCodeImage] = useState("");
  const [isCopy, setIsCopy] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  const formattedNameEvent = `${nameEvent.replace(/ /g, "-")}_`;
  const fullUrl = `${baseUrl}checkout/detail?Name=${formattedNameEvent}${idEvent}`;

  useEffect(() => {
    if (!show) return;
    setIsCopy(false);
    setIsDownloaded(false);
    QRCode.toDataURL(fullUrl, QR_OPTIONS)
      .then(setQrCodeImage)
      .catch(() => setQrCodeImage(""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, fullUrl]);

  if (!show) return null;

  function downloadQr() {
    if (!qrCodeImage) return;
    const link = document.createElement("a");
    link.href = qrCodeImage;
    link.download = `${formattedNameEvent}${idEvent}_QRCode.png`;
    link.click();
    setIsDownloaded(true);
    setTimeout(() => setIsDownloaded(false), 3000);
  }

  async function copyLink() {
    await navigator.clipboard.writeText(fullUrl);
    setIsCopy(true);
    setTimeout(() => setIsCopy(false), 3000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-lg bg-white p-4"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-center gap-2">
          <h5 className="flex-1 text-center text-base font-bold text-black">Compartir evento</h5>
          <button type="button" onClick={onClose} className="cursor-pointer border-none bg-white text-black">
            ✕
          </button>
        </div>

        <div className="flex flex-col items-center rounded-lg border-2 border-slate-200 py-4">
          {qrCodeImage ? (
            <img src={qrCodeImage} width={140} height={140} alt="QR Code" />
          ) : (
            <div className="h-[140px] w-[140px] animate-pulse bg-slate-100" />
          )}
          <div className="mt-4 w-2/3">
            <button
              type="button"
              onClick={downloadQr}
              className="w-full cursor-pointer rounded-lg bg-[#6b35f5] px-4 py-2 text-sm font-semibold text-white"
            >
              Descargar QR
            </button>
            {isDownloaded ? <p className="mt-1 text-center text-sm text-green-600">Descargado</p> : null}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-lg border-2 border-slate-200 p-2">
          <img src="/img/iconLink.svg" alt="" className="h-5 w-5" />
          <p className="flex-1 truncate text-sm text-slate-700" title={fullUrl}>
            {fullUrl}
          </p>
          <button
            type="button"
            onClick={copyLink}
            className="cursor-pointer rounded-lg bg-[#6b35f5] px-3 py-2 text-sm font-semibold text-white"
          >
            Copiar
          </button>
        </div>
        {isCopy ? <p className="mt-1 text-sm text-green-600">Copiado</p> : null}
      </div>
    </div>
  );
}
