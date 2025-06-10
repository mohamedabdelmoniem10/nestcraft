import { Hero } from '@/components/home/Hero';
import { Features } from '@/components/home/Features';
import { Demo } from '@/components/home/Demo';
import { Pricing } from '@/components/home/Pricing';
import { Testimonials } from '@/components/home/Testimonials';

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <Demo />
      <Pricing />
      <Testimonials />
    </>
  );
}