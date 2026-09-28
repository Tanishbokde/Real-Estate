import React from "react";
import Link from "next/link";
import { Building2, MapPin, Phone, Mail, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Platform Overview */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold shadow-md">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold text-white tracking-tight">
                  Nagpur<span className="text-orange-500">Realty</span>
                </span>
                <span className="text-[10px] ml-1.5 px-1.5 py-0.5 bg-orange-500/20 text-orange-400 rounded font-semibold uppercase">
                  MahaRERA
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Nagpur&apos;s authoritative property management platform connecting verified local brokers with home seekers and investors across Vidarbha.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Full Admin Oversight &amp; RERA Regulated Broker Network</span>
            </div>
          </div>

          {/* Col 2: Top Nagpur Localities */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Popular Localities
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/properties?locality=Dharampeth" className="hover:text-orange-400 transition">
                  Dharampeth (West Nagpur)
                </Link>
              </li>
              <li>
                <Link href="/properties?locality=Civil+Lines" className="hover:text-orange-400 transition">
                  Civil Lines (VIP Green Belt)
                </Link>
              </li>
              <li>
                <Link href="/properties?locality=Wardha+Road" className="hover:text-orange-400 transition">
                  Wardha Road &amp; Airport Corridor
                </Link>
              </li>
              <li>
                <Link href="/properties?locality=Besa" className="hover:text-orange-400 transition">
                  Besa &amp; Ghogli Road (Fast Growth)
                </Link>
              </li>
              <li>
                <Link href="/properties?locality=Ramdaspeth" className="hover:text-orange-400 transition">
                  Ramdaspeth (Medical &amp; Retail Hub)
                </Link>
              </li>
              <li>
                <Link href="/properties?locality=Manish+Nagar" className="hover:text-orange-400 transition">
                  Manish Nagar &amp; Beltarodi
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Portals */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Platform Portals
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/properties" className="hover:text-orange-400 transition">
                  Search All Listings (Buy &amp; Rent)
                </Link>
              </li>
              <li>
                <Link href="/customer" className="hover:text-orange-400 transition">
                  Customer Dashboard &amp; My Visits
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-orange-400 transition flex items-center gap-1">
                  <span>Admin Control Center</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1 rounded">Full CRUD</span>
                </Link>
              </li>
              <li>
                <Link href="/properties?type=commercial" className="hover:text-orange-400 transition">
                  Commercial Offices &amp; Showrooms
                </Link>
              </li>
              <li>
                <Link href="/properties?category=plot" className="hover:text-orange-400 transition">
                  NIT Sanctioned Plots &amp; Land
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Central Office & Contact */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Nagpur Headquarters
            </h4>
            <div className="flex items-start gap-2.5 text-xs text-slate-400">
              <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
              <span>
                Level 3, Vidarbha Trade Center, WHC Road, Dharampeth, Nagpur, Maharashtra - 440010
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-400">
              <Phone className="w-4 h-4 text-orange-500 shrink-0" />
              <span>+91 712 2548900 / +91 98230 45612</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-400">
              <Mail className="w-4 h-4 text-orange-500 shrink-0" />
              <span>desk@nagpurrealty.in</span>
            </div>
            <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-800">
              Operating Hours: Mon - Sat (9:30 AM - 7:30 PM IST)
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Nagpur Realty. All rights reserved. MahaRERA Reg: A50500099881.</p>
          <div className="flex items-center gap-4">
            <span>Nagpur City Focused</span>
            <span>•</span>
            <span>Supabase + PostgreSQL Architecture</span>
            <span>•</span>
            <span>Admin Controlled</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
