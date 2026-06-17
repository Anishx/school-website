import { BarChart2, UserPlus, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Stat = {
  icon: LucideIcon;
  value: string;
  label: string;
};

const stats: Stat[] = [
  { icon: BarChart2, value: "85%",  label: "Academic Performance" },
  { icon: UserPlus,  value: "100+", label: "New Admissions" },
  { icon: Zap,       value: "25+",  label: "Activities & Events" },
];

export function TrustProofStrip() {
  return (
    <section className="bg-teal-800" aria-label="Key school statistics">
      <div className="mx-auto max-w-7xl">
        <ul className="grid grid-cols-3 divide-x divide-white/10">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <li
                key={stat.label}
                className="flex flex-col items-center gap-1 px-4 py-6 text-center"
              >
                <Icon className="h-5 w-5 text-yellow-500 mb-1" aria-hidden="true" />
                <span className="text-2xl font-bold text-white">{stat.value}</span>
                <span className="text-sm font-semibold text-white/80">{stat.label}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
