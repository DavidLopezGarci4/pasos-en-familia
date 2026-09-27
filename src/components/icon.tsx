export function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z" /></>,
    tasks: <><rect x="5" y="4" width="15" height="17" rx="3"/><path d="M9 4V2m6 2V2M9 10l1 1 2-2m2 1h3M9 16l1 1 2-2m2 1h3"/></>,
    gift: <><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v9h14v-9M12 8v13"/><path d="M12 8H8a3 3 0 1 1 3-3l1 3Zm0 0h4a3 3 0 1 0-3-3l-1 3Z"/></>,
    family: <><circle cx="9" cy="7" r="3"/><path d="M2 21v-3a7 7 0 0 1 14 0v3M16 4a3 3 0 0 1 0 6m2 4a5 5 0 0 1 4 5v2"/></>,
    book: <><path d="M12 5C8 2 4 3 2 4v16c3-2 7-1 10 1 3-2 7-3 10-1V4c-2-1-6-2-10 1Zm0 0v16"/></>,
    settings: <><circle cx="12" cy="12" r="4"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M9 21h6"/></>,
    arrow: <><path d="M4 12h16m-6-6 6 6-6 6"/></>,
    plus: <path d="M12 5v14M5 12h14"/>,
    check: <path d="m5 12 4 4L19 6"/>,
    leaf: <><path d="M20 3C5 1 1 10 6 16s16 3 14-13ZM5 21 16 9"/></>,
    logout: <><path d="M9 3H4v18h5m0-9h13m-5-5 5 5-5 5"/></>,
    spark: <><path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"/></>,
    edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    trash: <><path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6m4-6v6"/></>,
    fire: <><path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.38 0 2.5-1.12 2.5-2.5 0-.69-.28-1.31-.73-1.77L12 12l-.77.73c-.45.46-.73 1.08-.73 1.77z"/><path d="M12 2c0 3-2 5-4 7.5C6 12 5 14 5 16.5A7 7 0 0 0 19 16.5c0-4-3-6-4.5-8.5C13 6 13 4 12 2z"/></>,
    pet: <><path d="M12 13c-2.5 0-5 1.5-5 3.5 0 1.5 1.5 2.5 5 2.5s5-1 5-2.5c0-2-2.5-3.5-5-3.5z"/><circle cx="7" cy="9" r="2"/><circle cx="17" cy="9" r="2"/><circle cx="10" cy="5" r="1.5"/><circle cx="14" cy="5" r="1.5"/></>,
    sword: <><path d="M14.5 17.5L3 6V3h3l11.5 11.5M13 19l2 2M19 13l2 2M16 16l4 4"/></>,
    tree: <><path d="M12 2L4 14h5v6h6v-6h5L12 2z"/><line x1="12" y1="20" x2="12" y2="24"/></>,
    sound: <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></>,
    mute: <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.spark}</svg>;
}


export function Brand() {
  return <div className="brand"><span className="brand-mark"><Icon name="leaf" size={26}/></span><span>pasos<span className="brand-dot">.</span><small>CRECEMOS EN FAMILIA</small></span></div>;
}

export function Garden() {
  return <svg className="garden" viewBox="0 0 380 220" fill="none" aria-hidden="true">
    <circle cx="280" cy="70" r="38" fill="#F4BE5E"/><circle cx="280" cy="70" r="50" stroke="#F4BE5E" strokeDasharray="2 9"/>
    <path d="M10 204C75 171 143 199 200 167c62-34 110-5 170 35" fill="#BCD3AE"/>
    <path d="M56 204V109m0 45C25 155 15 124 20 119c20-5 37 15 36 35Zm0-22c30 0 47-30 42-35-19-4-42 10-42 35Z" fill="#729879" stroke="#456B50" strokeWidth="3"/>
    <path d="M132 204V69m0 54c-32-2-49-34-41-43 21-4 42 22 41 43Zm0-29c30-3 46-36 36-44-23 0-36 19-36 44Z" fill="#D98A64" stroke="#A96346" strokeWidth="3"/>
    <path d="M214 204v-83m0 44c-30-1-37-21-32-28 21-2 32 11 32 28Zm0-21c25 0 42-23 35-30-19-5-37 12-35 30Z" fill="#96AE80" stroke="#456B50" strokeWidth="3"/>
    <path d="M292 204v-40" stroke="#456B50" strokeWidth="3"/><path d="M292 171c-30-22-7-44 0-26 10-22 33 2 0 26Z" fill="#E8A496"/>
    <path d="m325 108 5-10m-8-3-5-6m18 8 9-1M174 24l3 8m8 0 5-6" stroke="#A5B69B" strokeWidth="2" strokeLinecap="round"/>
    <path d="M20 205h330" stroke="#456B50" strokeWidth="2" strokeLinecap="round"/>
  </svg>;
}
