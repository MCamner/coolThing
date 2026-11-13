import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MotionConfig, motion, useReducedMotion } from 'motion/react';
import './style.css';

const spring = { type: 'spring', stiffness: 220, damping: 19 };
const cards = [
  ['01', 'Respons', 'För pekaren över kortet eller fokusera knappen med Tab.'],
  ['02', 'Rytm', 'En fjäder ger rörelsen en tydlig start och mjuk landning.'],
  ['03', 'Rum', 'Byt ordning och följ hur korten hittar sina nya platser.'],
];

function App() {
  const reduced = useReducedMotion();
  const [replay, setReplay] = useState(0);
  const [reverse, setReverse] = useState(false);
  const [selected, setSelected] = useState(null);
  return <main>
    <header><span>COOLTHING / EXPERIMENT 01</span><span role="status">{reduced ? 'Minskad rörelse aktiv' : 'Rörelse aktiv'}</span></header>
    <section className="hero" aria-labelledby="title">
      <p className="eyebrow">MOTION × REACT</p>
      <motion.h1 id="title" key={replay} initial={reduced ? false : { y: 45, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={spring}>Lite rörelse.<br /><span>Mer känsla.</span></motion.h1>
      <p>Ett litet rörelselabb. Prova fjädern, utforska korten och scrolla vidare.</p>
      <button onClick={() => setReplay(n => n + 1)}>Spela rubriken igen ↗</button>
    </section>
    <section aria-labelledby="cards-title">
      <div className="section-heading"><h2 id="cards-title">01 / Interaktion & layout</h2><button aria-pressed={reverse} onClick={() => setReverse(v => !v)}>Byt ordning ⇄</button></div>
      <div className="cards">
        {(reverse ? [...cards].reverse() : cards).map(([id, title, text]) => <motion.article key={id} layout={!reduced} transition={spring}>
          <motion.button className="card" aria-pressed={selected === id} onClick={() => setSelected(selected === id ? null : id)} whileHover={reduced ? undefined : { y: -8, scale: 1.02 }} whileFocus={reduced ? undefined : { y: -8 }} transition={spring}>
            <span className="number">{id} / {selected === id ? 'VALT' : 'PROVA'}</span><h3>{title}</h3><p>{text}</p><span aria-hidden="true">↗</span>
          </motion.button>
        </motion.article>)}
      </div>
      <p role="status">{selected ? `Kort ${selected} valt.` : 'Välj ett kort.'}</p>
    </section>
    <section className="scroll-section" aria-labelledby="scroll-title">
      <p className="eyebrow">02 / SCROLLA FÖR ATT UPPTÄCKA ↓</p>
      <motion.div className="reveal" initial={reduced ? false : { opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ amount: 0.5, once: false }} transition={{ duration: reduced ? 0 : 0.5 }}>
        <span className="number">FRÅN TYST TILL SYNLIG</span><h2 id="scroll-title">Här kommer nästa idé.</h2><p>Panelen tonas in när den når vyn. Med minskad rörelse visas allt direkt, utan fjäder, lyft eller layoutanimation.</p>
      </motion.div>
    </section>
    <footer>BYGGT MED MOTION / Anpassat efter din rörelseinställning.</footer>
  </main>;
}

createRoot(document.getElementById('root')).render(<MotionConfig reducedMotion="user"><App /></MotionConfig>);
