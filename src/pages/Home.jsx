import { useReveal } from '../lib/hooks';
import Hero from './home/Hero.jsx';
import Skills from './home/Skills.jsx';
import Projects from './home/Projects.jsx';
import Timeline from './home/Timeline.jsx';
import Contact from './home/Contact.jsx';

export default function Home() {
  const ref = useReveal();

  return (
    <div ref={ref}>
      <Hero />
      <Skills />
      <Projects />
      <Timeline />
      <Contact />
    </div>
  );
}
