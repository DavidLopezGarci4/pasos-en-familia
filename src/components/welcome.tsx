"use client";

import { useActionState } from "react";
import { authenticate } from "@/app/actions";
import { Brand, Garden, Icon } from "./icon";

export function Welcome({ setup }: { setup: boolean }) {
  const [state, action, pending] = useActionState(authenticate, {});
  return <main className="welcome">
    <section className="welcome-story"><Brand/><div><span className="eyebrow">PEQUEÑOS PASOS. GRANDES CAMBIOS.</span><h1>Crecer es mejor<br/>cuando lo hacemos<br/><em>en familia.</em></h1><p>Un lugar para acompañar los hábitos, reconocer el esfuerzo y celebrar lo que vais consiguiendo juntos.</p><Garden/></div><span className="welcome-foot"><Icon name="leaf"/> Cada familia tiene su propio ritmo.</span></section>
    <section className="welcome-form"><div className="form-card"><span className="pill"><Icon name="home" size={15}/> Vuestro espacio privado</span><h2>{setup ? "Aquí empieza vuestro camino" : "Qué bien tenerte de vuelta"}</h2><p>{setup ? "Crea el acceso del primer adulto. Después podrás añadir a tus hijos y al otro progenitor." : "Entra con tu nombre y tu clave para continuar."}</p>
      <form action={action}>
        <input type="hidden" name="mode" value={setup ? "setup" : "login"}/>
        {setup && <label>Nombre de la familia<input name="familia" placeholder="Familia García" maxLength={60} required autoComplete="organization"/></label>}
        <label>Nombre de acceso<input name="nombre" placeholder={setup ? "Tu nombre o alias" : "Tu nombre"} minLength={2} maxLength={40} required autoComplete="username"/></label>
        <label>{setup ? "Contraseña del adulto" : "Contraseña o clave"}<input name="clave" type="password" minLength={setup ? 10 : 6} maxLength={128} required autoComplete={setup ? "new-password" : "current-password"}/></label>
        {setup && <small>Usa al menos 10 caracteres. Los niños tendrán su propio acceso.</small>}
        {state.error && <p role="alert" className="notice error">{state.error}</p>}
         <button className="button primary full" disabled={pending}>{pending ? "Un momento…" : setup ? "Crear nuestro espacio" : "Entrar en familia"}<Icon name="arrow"/></button>
      </form><p className="form-note">{setup ? "Sin registros públicos. Sin clasificaciones. A vuestro ritmo." : "Los adultos administran el portal. Cada niño ve solo su propio espacio."}</p>
    </div></section>
  </main>;
}
