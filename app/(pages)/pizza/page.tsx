import PizzaGame from '@/app/components/pizza-game/pizza-game';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "פיצה בעיר",
  description: "משחק מהנה לכל המשפחה",
  icons: {
    icon: "/assets/pizza-icon.png",
  },
  openGraph: {
    title: "פיצה בעיר",
    description: "משחק מהנה לכל המשפחה",
    locale: 'he_IL',
    type: 'website',
  },
}

export default function PizzaGamePage() {
  return (
    <div className="min-h-screen bg-black">
      <PizzaGame />
    </div>
  );
}
