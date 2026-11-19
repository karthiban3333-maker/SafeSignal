import { QRCodeSVG } from 'qrcode.react';
import { Download } from 'lucide-react';

export default function QRGenerator({ companyId }) {
  if (!companyId) return null;

  const guestURL = `${window.location.origin}/guest-login?cid=${companyId}`;

  const downloadQR = () => {
    const svg = document.getElementById('guest-qr-code');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `SafeSignal-GuestQR-${companyId}.png`;
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-2xl">
      <div className="mb-6 p-4 bg-white border-4 border-gray-100 rounded-xl">
        <QRCodeSVG
          id="guest-qr-code"
          value={guestURL}
          size={256}
          level="H"
          includeMargin={true}
          bgColor={"#ffffff"}
          fgColor={"#0a0a0f"}
        />
      </div>
      
      <p className="text-gray-600 text-sm font-medium mb-2 text-center">
        Guests scan this to join your company<br/>emergency network
      </p>
      
      <div className="bg-gray-100 px-4 py-2 rounded-lg mb-6 max-w-full overflow-hidden text-ellipsis">
        <p className="text-xs text-gray-500 font-mono select-all">
          {guestURL}
        </p>
      </div>

      <button
        onClick={downloadQR}
        className="w-full py-3 bg-gray-900 rounded-xl text-white font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
      >
        <Download className="w-5 h-5" />
        Download QR Code
      </button>
    </div>
  );
}
