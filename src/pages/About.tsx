import React, { useState } from "react";

export default function About() {
  const [copied, setCopied] = useState(false);

  const openLink = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://ika-xi.vercel.app").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-[#F9F9F9] flex justify-center py-12 px-4 sm:px-6 lg:px-8">
      <style>{`
        .about-page {
          max-width: 660px;
          width: 100%;
          font-family: var(--font-sans), sans-serif;
        }
        .about-hero {
          background: #000;
          color: #fff;
          border-radius: 16px;
          padding: 3rem 2.5rem;
          margin-bottom: 2.5rem;
          text-align: center;
        }
        .about-hero-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 2rem;
        }
        .about-hero-logo svg {
          display: block;
        }
        .about-hero-logo-name {
          font-size: 22px;
          font-weight: 500;
          letter-spacing: -0.5px;
          color: #fff;
        }
        .about-hero-tagline {
          font-size: 26px;
          font-weight: 500;
          line-height: 1.25;
          letter-spacing: -0.8px;
          margin-bottom: 1rem;
        }
        .about-hero-sub {
          font-size: 15px;
          color: rgba(255, 255, 255, 0.55);
          line-height: 1.7;
          max-width: 460px;
          margin: 0 auto 2rem;
        }
        .about-hero-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #fff;
          color: #000;
          font-size: 14px;
          font-weight: 500;
          padding: 10px 24px;
          border-radius: 40px;
          text-decoration: none;
          cursor: pointer;
          border: none;
          transition: background 0.2s ease;
        }
        .about-hero-cta:hover {
          background: #e8e8e8;
        }
        .about-section {
          margin-bottom: 2.5rem;
        }
        .about-section-eyebrow {
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: .1em;
          color: var(--color-text-tertiary);
          margin-bottom: .5rem;
        }
        .about-section-title {
          font-size: 20px;
          font-weight: 500;
          color: var(--color-text-primary);
          letter-spacing: -0.4px;
          margin-bottom: 1rem;
          line-height: 1.3;
        }
        .about-section-body {
          font-size: 15px;
          color: var(--color-text-secondary);
          line-height: 1.75;
        }
        .about-big-quote {
          background: var(--color-background-secondary);
          border-radius: 12px;
          padding: 1.75rem 2rem;
          margin-bottom: 2.5rem;
          border-left: 3px solid #000;
        }
        .about-big-quote p {
          font-size: 17px;
          font-style: italic;
          color: var(--color-text-primary);
          line-height: 1.7;
        }
        .about-big-quote-src {
          font-size: 13px;
          color: var(--color-text-tertiary);
          margin-top: .75rem;
        }
        .about-steps {
          display: flex;
          flex-direction: column;
          gap: 0;
          margin-top: 1.25rem;
        }
        .about-step {
          display: flex;
          gap: 1.25rem;
          padding: 1rem 0;
          border-bottom: .5px solid var(--color-border-tertiary);
        }
        .about-step:last-child {
          border-bottom: none;
        }
        .about-step-num {
          width: 32px;
          height: 32px;
          background: #000;
          color: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 500;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .about-step-content {}
        .about-step-title {
          font-size: 15px;
          font-weight: 500;
          color: var(--color-text-primary);
          margin-bottom: 4px;
        }
        .about-step-desc {
          font-size: 14px;
          color: var(--color-text-secondary);
          line-height: 1.65;
        }
        .about-audience-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 1.25rem;
        }
        @media(max-width: 640px) {
          .about-audience-grid {
            grid-template-columns: 1fr;
          }
        }
        .about-audience-card {
          background: var(--color-background-secondary);
          border-radius: 12px;
          padding: 1.25rem;
        }
        .about-audience-icon {
          font-size: 20px;
          color: var(--color-text-primary);
          margin-bottom: .75rem;
        }
        .about-audience-title {
          font-size: 14px;
          font-weight: 500;
          color: var(--color-text-primary);
          margin-bottom: .4rem;
        }
        .about-audience-desc {
          font-size: 13px;
          color: var(--color-text-secondary);
          line-height: 1.6;
        }
        .about-benefits {
          display: flex;
          flex-direction: column;
          gap: 0;
          margin-top: 1.25rem;
        }
        .about-benefit {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          padding: .9rem 0;
          border-bottom: .5px solid var(--color-border-tertiary);
        }
        .about-benefit:last-child {
          border-bottom: none;
        }
        .about-benefit-icon {
          width: 36px;
          height: 36px;
          background: var(--color-background-secondary);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 18px;
          color: var(--color-text-primary);
        }
        .about-benefit-text {}
        .about-benefit-title {
          font-size: 14px;
          font-weight: 500;
          color: var(--color-text-primary);
          margin-bottom: 3px;
        }
        .about-benefit-desc {
          font-size: 13px;
          color: var(--color-text-secondary);
          line-height: 1.6;
        }
        .about-contrast-block {
          background: #000;
          color: #fff;
          border-radius: 12px;
          padding: 1.75rem 2rem;
          margin-bottom: 2.5rem;
        }
        .about-contrast-block .about-contrast-title {
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 1rem;
        }
        .about-contrast-row {
          display: flex;
          gap: 0;
          margin-top: .5rem;
        }
        @media(max-width: 640px) {
          .about-contrast-row {
            flex-direction: column;
            gap: 12px;
          }
        }
        .about-contrast-col {
          flex: 1;
          padding: .75rem 1rem;
          border-radius: 8px;
        }
        .about-contrast-col.before {
          background: rgba(255,255,255,0.07);
        }
        .about-contrast-col.after {
          background: rgba(255,255,255,0.14);
        }
        .about-contrast-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: .08em;
          color: rgba(255,255,255,0.4);
          margin-bottom: .5rem;
        }
        .about-contrast-item {
          font-size: 13px;
          color: rgba(255,255,255,0.75);
          line-height: 1.65;
          padding: 3px 0;
          display: flex;
          gap: 6px;
          align-items: flex-start;
        }
        .about-contrast-item::before {
          content: "·";
          flex-shrink: 0;
        }
        .about-contrast-item.good {
          color: #fff;
        }
        .about-contrast-item.good::before {
          content: "✓";
          color: rgba(255,255,255,0.5);
        }
        .about-contrast-gap {
          width: 12px;
          flex-shrink: 0;
        }
        .about-faq {
          margin-top: 1.25rem;
        }
        .about-faq-item {
          padding: .9rem 0;
          border-bottom: .5px solid var(--color-border-tertiary);
        }
        .about-faq-item:last-child {
          border-bottom: none;
        }
        .about-faq-q {
          font-size: 14px;
          font-weight: 500;
          color: var(--color-text-primary);
          margin-bottom: .4rem;
        }
        .about-faq-a {
          font-size: 13px;
          color: var(--color-text-secondary);
          line-height: 1.65;
        }
        .about-share-block {
          border: .5px solid var(--color-border-tertiary);
          border-radius: 12px;
          padding: 1.75rem 2rem;
          text-align: center;
        }
        .about-share-title {
          font-size: 16px;
          font-weight: 500;
          color: var(--color-text-primary);
          margin-bottom: .5rem;
        }
        .about-share-desc {
          font-size: 14px;
          color: var(--color-text-secondary);
          margin-bottom: 1.25rem;
          line-height: 1.6;
        }
        .about-share-url {
          font-size: 13px;
          font-family: var(--font-mono);
          background: var(--color-background-secondary);
          border-radius: 8px;
          padding: .6rem 1rem;
          display: inline-block;
          color: var(--color-text-primary);
          margin-bottom: 1rem;
          border: .5px solid var(--color-border-tertiary);
        }
        .about-share-buttons {
          display: flex;
          gap: 8px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .about-share-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          background: var(--color-background-secondary);
          border: .5px solid var(--color-border-tertiary);
          border-radius: 8px;
          padding: 8px 16px;
          color: var(--color-text-primary);
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .about-share-btn:hover {
          background: var(--color-background-tertiary);
        }
        .about-share-btn.primary {
          background: #000;
          color: #fff;
          border-color: #000;
        }
        .about-share-btn.primary:hover {
          background: #222;
        }
        .about-footer-note {
          text-align: center;
          font-size: 12px;
          color: var(--color-text-tertiary);
          padding: 1.5rem 0 0;
          border-top: .5px solid var(--color-border-tertiary);
          margin-top: 1rem;
          line-height: 1.7;
        }
        @media(prefers-color-scheme:dark){
          .about-hero { background: #111; }
          .about-big-quote { border-left-color: #fff; }
          .about-step-num { background: #fff; color: #000; }
          .about-contrast-block {
            background: #111;
            border: .5px solid var(--color-border-tertiary);
          }
          .about-share-btn.primary {
            background: #fff;
            color: #000;
            border-color: #fff;
          }
          .about-share-btn.primary:hover {
            background: #e0e0e0;
          }
        }
      `}</style>

      <div className="about-page animate-fade-in">
        <h2 className="sr-only">Page à propos d'IKA — plateforme de galerie photo événementielle live</h2>

        <div className="about-hero">
          <div className="about-hero-logo">
            <svg width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect x="1" y="1" width="38" height="38" rx="5" stroke="white" stroke-width="3" fill="none"/>
              <rect x="7" y="7" width="7" height="7" rx="1.5" fill="white"/>
              <rect x="17" y="7" width="7" height="7" rx="1.5" fill="white"/>
              <rect x="27" y="7" width="7" height="7" rx="1.5" fill="white"/>
              <rect x="7" y="17" width="7" height="7" rx="1.5" fill="white"/>
              <rect x="27" y="17" width="7" height="7" rx="1.5" fill="white"/>
              <rect x="7" y="27" width="7" height="7" rx="1.5" fill="white"/>
              <rect x="17" y="27" width="7" height="7" rx="1.5" fill="white"/>
              <rect x="27" y="27" width="7" height="7" rx="1.5" fill="white"/>
            </svg>
            <span className="about-hero-logo-name">IKA</span>
          </div>
          <div className="about-hero-tagline">Les photos de votre événement,<br />en temps réel.</div>
          <div className="about-hero-sub">Fini l'attente. Dès que le photographe prend une photo, vos invités la voient sur leur téléphone — pendant l'événement lui-même.</div>
          <button className="about-hero-cta" onClick={() => openLink("https://ika-xi.vercel.app")}>
            <i className="ti ti-arrow-right" aria-hidden="true"></i> Découvrir IKA
          </button>
        </div>

        <div className="about-section">
          <div className="about-section-eyebrow">Le problème qu'on résout</div>
          <div className="about-section-title">Vous avez déjà attendu des semaines pour recevoir les photos d'un mariage ?</div>
          <div className="about-section-body">
            C'est la réalité de beaucoup d'événements. Le photographe repart avec ses fichiers, les traite chez lui, et plusieurs jours — parfois plusieurs semaines — plus tard, les invités reçoivent enfin un lien. L'émotion du moment est passée.
            <br /><br />
            IKA change ça. Les photos apparaissent dans la galerie au fur et à mesure que le photographe les prend. Vos invités n'ont rien à installer. Ils scannent un QR Code, et c'est tout.
          </div>
        </div>

        <div className="about-big-quote">
          <p>« Imaginez : vous êtes à un mariage, vous venez de danser, et une minute plus tard vous voyez déjà la photo sur votre téléphone. »</p>
          <div className="about-big-quote-src">— Voilà ce qu'IKA rend possible.</div>
        </div>

        <div className="about-section">
          <div className="about-section-eyebrow">Comment ça marche</div>
          <div className="about-section-title">Trois étapes. Pas plus.</div>
          <div className="about-steps">
            <div className="about-step">
              <div className="about-step-num">1</div>
              <div className="about-step-content">
                <div className="about-step-title">L'organisateur crée l'événement</div>
                <div className="about-step-desc">En quelques minutes, il configure l'événement sur IKA : nom, lieu, date, photo de couverture. Le système génère automatiquement une galerie avec son propre QR Code et son lien web unique.</div>
              </div>
            </div>
            <div className="about-step">
              <div className="about-step-num">2</div>
              <div className="about-step-content">
                <div className="about-step-title">Le photographe uploade en direct</div>
                <div className="about-step-desc">L'organisateur envoie un lien privé au(x) photographe(s). Dès qu'ils ont pris leurs photos, ils les publient depuis leur téléphone ou ordinateur — et elles apparaissent instantanément dans la galerie.</div>
              </div>
            </div>
            <div className="about-step">
              <div className="about-step-num">3</div>
              <div className="about-step-content">
                <div className="about-step-title">Les invités consultent et téléchargent</div>
                <div className="about-step-desc">Un simple scan du QR Code affiché à l'événement — ou un clic sur le lien partagé — suffit. Pas de compte, pas d'application à installer. Les photos défilent en temps réel, et chacun peut télécharger celles qu'il veut.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="about-section">
          <div className="about-section-eyebrow">À qui s'adresse IKA</div>
          <div className="about-section-title">Pour tous ceux qui organisent des moments qui comptent.</div>
          <div className="about-audience-grid">
            <div className="about-audience-card">
              <div className="about-audience-icon"><i className="ti ti-heart" aria-hidden="true"></i></div>
              <div className="about-audience-title">Mariages & célébrations</div>
              <div className="about-audience-desc">Mariages, baptêmes, anniversaires, fiançailles. Partagez les souvenirs avec toute la famille — y compris ceux qui n'ont pas pu être là.</div>
            </div>
            <div className="about-audience-card">
              <div className="about-audience-icon"><i className="ti ti-building" aria-hidden="true"></i></div>
              <div className="about-audience-title">Entreprises & conférences</div>
              <div className="about-audience-desc">Séminaires, lancements de produits, team buildings, galas. Valorisez votre image en partageant les photos en direct avec vos participants et collaborateurs.</div>
            </div>
            <div className="about-audience-card">
              <div className="about-audience-icon"><i className="ti ti-camera" aria-hidden="true"></i></div>
              <div className="about-audience-title">Photographes professionnels</div>
              <div className="about-audience-desc">Offrez à vos clients une expérience premium. Publiez vos meilleures photos en live et impressionnez dès le soir de l'événement.</div>
            </div>
            <div className="about-audience-card">
              <div className="about-audience-icon"><i className="ti ti-confetti" aria-hidden="true"></i></div>
              <div className="about-audience-title">Associations & événements culturels</div>
              <div className="about-audience-desc">Festivals, galas, cérémonies scolaires, remises de prix. Créez une galerie partageable que votre communauté gardera longtemps.</div>
            </div>
          </div>
        </div>

        <div className="about-contrast-block">
          <div className="about-contrast-title">Avant IKA vs. avec IKA</div>
          <div className="about-contrast-row">
            <div className="about-contrast-col before">
              <div className="about-contrast-label">Avant</div>
              <div className="about-contrast-item">Attente de plusieurs jours ou semaines</div>
              <div className="about-contrast-item">Photos envoyées par email ou WeTransfer</div>
              <div className="about-contrast-item">Invités qui oublient de demander</div>
              <div className="about-contrast-item">L'émotion du moment est passée</div>
              <div className="about-contrast-item">Galerie vite perdue dans les emails</div>
            </div>
            <div className="about-contrast-gap"></div>
            <div className="about-contrast-col after">
              <div className="about-contrast-label">Avec IKA</div>
              <div className="about-contrast-item good">Photos visibles en quelques secondes</div>
              <div className="about-contrast-item good">Un QR Code suffit pour tout le monde</div>
              <div className="about-contrast-item good">Galerie accessible sans inscription</div>
              <div className="about-contrast-item good">Souvenirs partagés pendant l'événement</div>
              <div className="about-contrast-item good">Lien permanent, toujours disponible</div>
            </div>
          </div>
        </div>

        <div className="about-section">
          <div className="about-section-eyebrow">Ce qu'IKA vous apporte</div>
          <div className="about-section-title">Des bénéfices concrets, pour tout le monde.</div>
          <div className="about-benefits">
            <div className="about-benefit">
              <div className="about-benefit-icon"><i className="ti ti-clock" aria-hidden="true"></i></div>
              <div className="about-benefit-text">
                <div className="about-benefit-title">Zéro attente pour vos invités</div>
                <div className="about-benefit-desc">Les photos arrivent en direct pendant l'événement. Plus besoin de courir après le photographe pendant des semaines.</div>
              </div>
            </div>
            <div className="about-benefit">
              <div className="about-benefit-icon"><i className="ti ti-qrcode" aria-hidden="true"></i></div>
              <div className="about-benefit-text">
                <div className="about-benefit-title">Un QR Code, c'est tout</div>
                <div className="about-benefit-desc">Imprimez-le sur une table, projetez-le sur un écran, ou envoyez le lien sur WhatsApp. Vos invités accèdent à la galerie en un scan, depuis n'importe quel téléphone.</div>
              </div>
            </div>
            <div className="about-benefit">
              <div className="about-benefit-icon"><i className="ti ti-download" aria-hidden="true"></i></div>
              <div className="about-benefit-text">
                <div className="about-benefit-title">Téléchargement libre</div>
                <div className="about-benefit-desc">Chaque invité peut télécharger les photos qu'il souhaite, directement depuis son téléphone. En haute qualité, sans passer par une application tierce.</div>
              </div>
            </div>
            <div className="about-benefit">
              <div className="about-benefit-icon"><i className="ti ti-lock" aria-hidden="true"></i></div>
              <div className="about-benefit-text">
                <div className="about-benefit-title">Galerie privée et maîtrisée</div>
                <div className="about-benefit-desc">Seul le photographe assigné par l'organisateur peut publier des photos. Les invités consultent uniquement — personne ne peut rien uploader sans autorisation.</div>
              </div>
            </div>
            <div className="about-benefit">
              <div className="about-benefit-icon"><i className="ti ti-chart-bar" aria-hidden="true"></i></div>
              <div className="about-benefit-text">
                <div className="about-benefit-title">Statistiques en temps réel</div>
                <div className="about-benefit-desc">L'organisateur voit combien de personnes consultent la galerie, combien de photos ont été publiées, et combien ont été téléchargées — en direct depuis son tableau de bord.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="about-section">
          <div className="about-section-eyebrow">Questions fréquentes</div>
          <div className="about-section-title">Vous avez des questions ? On a les réponses.</div>
          <div className="about-faq">
            <div className="about-faq-item">
              <div className="about-faq-q">Est-ce que les invités doivent créer un compte ?</div>
              <div className="about-faq-a">Non. Les invités accèdent à la galerie directement via le QR Code ou le lien partagé — sans inscription, sans mot de passe, sans application à installer.</div>
            </div>
            <div className="about-faq-item">
              <div className="about-faq-q">Qui peut publier des photos dans la galerie ?</div>
              <div className="about-faq-a">Uniquement les photographes auxquels l'organisateur a donné accès via un lien privé. Les invités ne peuvent que consulter et télécharger — jamais publier.</div>
            </div>
            <div className="about-faq-item">
              <div className="about-faq-q">Combien de photographes peuvent intervenir sur un même événement ?</div>
              <div className="about-faq-a">Autant que vous le souhaitez. Plusieurs photographes peuvent publier simultanément dans la même galerie — les photos de chacun apparaissent en temps réel pour tous les invités.</div>
            </div>
            <div className="about-faq-item">
              <div className="about-faq-q">La galerie reste-t-elle accessible après l'événement ?</div>
              <div className="about-faq-a">Oui. La galerie reste disponible à son URL permanente aussi longtemps que l'organisateur le souhaite. Il peut l'archiver ou la supprimer à tout moment depuis son tableau de bord.</div>
            </div>
            <div className="about-faq-item">
              <div className="about-faq-q">Est-ce que ça fonctionne bien sur mobile ?</div>
              <div className="about-faq-a">Oui, IKA est conçu pour le mobile en priorité. La galerie s'adapte parfaitement à tous les écrans de téléphone — c'est là que vos invités la consulteront pendant l'événement.</div>
            </div>
            <div className="about-faq-item">
              <div className="about-faq-q">Et si le réseau est faible pendant l'événement ?</div>
              <div className="about-faq-a">La galerie bascule automatiquement en mode d'actualisation régulière si la connexion est instable — les invités continuent de voir les nouvelles photos, juste avec un léger délai.</div>
            </div>
          </div>
        </div>

        <div className="about-share-block">
          <div className="about-share-title">Partagez IKA avec quelqu'un qui en a besoin</div>
          <div className="about-share-desc">Vous organisez un événement bientôt ? Ou vous connaissez quelqu'un qui organise un mariage, une conférence, une soirée ? Partagez-leur ce lien.</div>
          <div className="about-share-url">https://ika-xi.vercel.app</div>
          <div className="about-share-buttons">
            <button className="about-share-btn primary" onClick={handleCopyLink}>
              <i className={copied ? "ti ti-check" : "ti ti-copy"} aria-hidden="true"></i> {copied ? "Lien copié ✓" : "Copier le lien"}
            </button>
            <button className="about-share-btn" onClick={() => openLink("https://wa.me/?text=Regarde%20IKA%20%E2%80%94%20une%20galerie%20photo%20live%20pour%20les%20%C3%A9v%C3%A9nements%20%3A%20https%3A%2F%2Fika-xi.vercel.app")}>
              <i className="ti ti-brand-whatsapp" aria-hidden="true"></i> WhatsApp
            </button>
            <button className="about-share-btn" onClick={() => openLink("https://ika-xi.vercel.app")}>
              <i className="ti ti-external-link" aria-hidden="true"></i> Ouvrir IKA
            </button>
          </div>
        </div>

        <div className="about-footer-note">
          IKA est une plateforme indépendante.<br />
          Développée pour que chaque événement laisse une trace, immédiatement.
        </div>
      </div>
    </div>
  );
}
