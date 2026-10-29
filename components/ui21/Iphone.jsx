'use client';

/* iPhone frame: Magic UI's mockup (magicui.design, MIT), as listed on 21st.dev.
 * Ported to plain JSX and CSS for this site: dark theme, and the screen takes any children (a live site
 * here). SVG ids are unique per instance.
 * statusBar: a real iPhone's status bar (time, signal, Wi-Fi, battery) beside the Dynamic Island, with the
 * children below it and the home indicator over them, the way Safari lays a page out on the phone, so nothing
 * of the page is ever hidden behind the island. */
import { useId } from 'react';

const PW = 433, PH = 882, SX = 21.25, SY = 19.25, SWD = 389.5, SHT = 843.5, R = 55.75;
const BAR = 54; // the status bar's height in points, on a 390-point-wide screen (Dynamic Island iPhones)
const SCREEN = {
  left: `${(SX / PW) * 100}%`, top: `${(SY / PH) * 100}%`, width: `${(SWD / PW) * 100}%`, height: `${(SHT / PH) * 100}%`,
  borderRadius: `${(R / SWD) * 100}% / ${(R / SHT) * 100}%`,
};

function StatusBar() {
  return (
    <svg className="u21-iphone__status" viewBox={`0 0 390 ${BAR}`} aria-hidden="true">
      <text x="66" y="35.5" textAnchor="middle">9:41</text>
      <g fill="#FFFFFF">
        <rect x="286" y="28.5" width="3.2" height="6" rx="1" />
        <rect x="291" y="26" width="3.2" height="8.5" rx="1" />
        <rect x="296" y="23.5" width="3.2" height="11" rx="1" />
        <rect x="301" y="21" width="3.2" height="13.5" rx="1" />
        <path d="M318 35.2l-3.3-3.4a4.7 4.7 0 0 1 6.6 0z" />
      </g>
      <g fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round">
        <path d="M312.4 29.6a8 8 0 0 1 11.2 0" />
        <path d="M309 26.2a12.8 12.8 0 0 1 18 0" />
      </g>
      <rect x="333.5" y="23.5" width="25" height="12" rx="3.6" fill="none" stroke="#FFFFFF" strokeOpacity="0.45" strokeWidth="1.1" />
      <rect x="335.5" y="25.5" width="19" height="8" rx="2.2" fill="#FFFFFF" />
      <path d="M360 27.6v4c.9-.3 1.5-1.1 1.5-2s-.6-1.7-1.5-2z" fill="#FFFFFF" fillOpacity="0.45" />
    </svg>
  );
}

export default function Iphone({ children, className = '', style, statusBar = false }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <div className={`u21-iphone ${className}`.trim()} style={{ aspectRatio: `${PW} / ${PH}`, ...style }}>
      <div className="u21-iphone__screen" style={SCREEN}>
        {statusBar ? (
          <>
            <StatusBar />
            <div className="u21-iphone__view" style={{ top: `${(BAR / SHT) * 100}%` }}>{children}</div>
            <i className="u21-iphone__home" aria-hidden="true" />
          </>
        ) : children}
      </div>
      <svg className="u21-iphone__frame" viewBox={`0 0 ${PW} ${PH}`} fill="none" aria-hidden="true">
        <defs>
          <mask id={`${id}p`} maskUnits="userSpaceOnUse">
            <rect x="0" y="0" width={PW} height={PH} fill="white" />
            <rect x={SX} y={SY} width={SWD} height={SHT} rx={R} ry={R} fill="black" />
          </mask>
        </defs>
        <g mask={`url(#${id}p)`}>
        <path d="M2 73C2 32.6832 34.6832 0 75 0H357C397.317 0 430 32.6832 430 73V809C430 849.317 397.317 882 357 882H75C34.6832 882 2 849.317 2 809V73Z" fill="#2B2C32" />
        <path d="M0 171C0 170.448 0.447715 170 1 170H3V204H1C0.447715 204 0 203.552 0 203V171Z" fill="#2B2C32" />
        <path d="M1 234C1 233.448 1.44772 233 2 233H3.5V300H2C1.44772 300 1 299.552 1 299V234Z" fill="#2B2C32" />
        <path d="M1 319C1 318.448 1.44772 318 2 318H3.5V385H2C1.44772 385 1 384.552 1 384V319Z" fill="#2B2C32" />
        <path d="M430 279H432C432.552 279 433 279.448 433 280V384C433 384.552 432.552 385 432 385H430V279Z" fill="#2B2C32" />
        <path d="M6 74C6 35.3401 37.3401 4 76 4H356C394.66 4 426 35.3401 426 74V808C426 846.66 394.66 878 356 878H76C37.3401 878 6 846.66 6 808V74Z" fill="#121317" />
        <path opacity="0.5" d="M174 5H258V5.5C258 6.60457 257.105 7.5 256 7.5H176C174.895 7.5 174 6.60457 174 5.5V5Z" fill="#2B2C32" />
        <path d="M21.25 75C21.25 44.2101 46.2101 19.25 77 19.25H355C385.79 19.25 410.75 44.2101 410.75 75V807C410.75 837.79 385.79 862.75 355 862.75H77C46.2101 862.75 21.25 837.79 21.25 807V75Z" fill="#2B2C32" />
        </g>
        {/* the dynamic island sits over the screen */}
        <path d="M154 48.5C154 38.2827 162.283 30 172.5 30H259.5C269.717 30 278 38.2827 278 48.5C278 58.7173 269.717 67 259.5 67H172.5C162.283 67 154 58.7173 154 48.5Z" fill="#121317" />
        <path d="M249 48.5C249 42.701 253.701 38 259.5 38C265.299 38 270 42.701 270 48.5C270 54.299 265.299 59 259.5 59C253.701 59 249 54.299 249 48.5Z" fill="#121317" />
        <path d="M254 48.5C254 45.4624 256.462 43 259.5 43C262.538 43 265 45.4624 265 48.5C265 51.5376 262.538 54 259.5 54C256.462 54 254 51.5376 254 48.5Z" fill="#2B2C32" />
      </svg>
    </div>
  );
}
