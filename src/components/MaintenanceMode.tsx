"use client"

import { Globe, Lock } from "lucide-react"

export function MaintenanceMode() {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-texture-linen p-6">
            <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="relative mx-auto w-24 h-24 flex items-center justify-center rounded-3xl bg-brand-teal/10 border border-brand-teal/20 shadow-inner">
                    <Globe className="h-10 w-10 text-brand-teal animate-pulse" />
                    <div className="absolute -right-2 -top-2 p-1.5 bg-brand-gold rounded-lg shadow-lg">
                        <Lock className="h-4 w-4 text-white" />
                    </div>
                </div>
                
                <div className="space-y-4">
                    <h1 className="text-4xl lg:text-5xl font-serif font-bold text-brand-umber leading-tight">
                        Curating <br /> <span className="text-brand-teal italic">Excellence</span>
                    </h1>
                    <p className="text-slate-600 font-medium max-w-sm mx-auto">
                        We are currently refreshing our gallery to bring you new heritage-inspired pieces. Please check back shortly.
                    </p>
                </div>

                <div className="pt-8 border-t border-brand-teal/10 flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400">
                        <span className="h-1 w-1 rounded-full bg-brand-gold" />
                        Tac Accessories
                        <span className="h-1 w-1 rounded-full bg-brand-gold" />
                    </div>
                    <p className="text-xs text-slate-500 italic">
                        Experience Premium African Artistry Reimagined
                    </p>
                </div>
            </div>
        </div>
    )
}
