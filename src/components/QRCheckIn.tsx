// QR Check-in — inspirado en QRCode-Smart-Attendance-System-with-Geolocation
import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import { QrCode, MapPin, CheckCircle2, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { haversineMeters } from "@/lib/geo/utils";
import { toast } from "sonner";

interface QRCheckInProps {
  targetType: "place" | "business";
  targetId: string;
  targetName: string;
  targetLat: number;
  targetLng: number;
  maxDistanceMeters?: number;
}

const QRCheckIn = ({
  targetType, targetId, targetName, targetLat, targetLng,
  maxDistanceMeters = 200,
}: QRCheckInProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);

  const qrToken = `rdmx://checkin/${targetType}/${targetId}/${user?.id || "anon"}`;

  const handleCheckIn = async () => {
    if (!user) {
      toast.error("Inicia sesión para hacer check-in");
      return;
    }
    if (!navigator.geolocation) {
      toast.error("Geolocalización no soportada");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const d = haversineMeters(latitude, longitude, targetLat, targetLng);
        setDistance(Math.round(d));
        const verifiedOk = d <= maxDistanceMeters;

        const { error } = await supabase.from("visit_checkins").insert({
          user_id: user.id,
          target_type: targetType,
          target_id: targetId,
          user_lat: latitude,
          user_lng: longitude,
          distance_meters: d,
          qr_token: qrToken,
          verified: verifiedOk,
        });
        setLoading(false);
        if (error) {
          toast.error(`Error: ${error.message}`);
          return;
        }
        setVerified(verifiedOk);
        if (verifiedOk) {
          toast.success(`✓ Check-in verificado en ${targetName} (${Math.round(d)}m)`);
        } else {
          toast.warning(`Estás a ${Math.round(d)}m — fuera del rango de ${maxDistanceMeters}m`);
        }
      },
      (err) => {
        setLoading(false);
        toast.error(`GPS error: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 px-2 py-1 text-[10px] rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400"
      >
        <QrCode className="w-3 h-3" /> Check-in QR
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="glass-panel-strong border-sovereign p-6 w-80 max-w-[90vw]"
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-sans font-semibold text-sm">Check-in soberano</h3>
                <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="bg-white p-4 rounded-lg flex items-center justify-center mb-4">
                <QRCodeCanvas value={qrToken} size={180} />
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                <strong className="text-foreground">{targetName}</strong>
                <br />
                Verificación por proximidad GPS (≤ {maxDistanceMeters}m)
              </p>
              {distance !== null && (
                <div className={`flex items-center gap-2 text-xs mb-3 ${verified ? "text-emerald-400" : "text-amber-400"}`}>
                  {verified ? <CheckCircle2 className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                  Distancia detectada: {distance}m
                </div>
              )}
              <button
                onClick={handleCheckIn}
                disabled={loading || !user}
                className="w-full flex items-center justify-center gap-2 py-2 bg-primary text-primary-foreground rounded text-xs font-semibold disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <MapPin className="w-3 h-3" />}
                {user ? "Verificar mi presencia" : "Inicia sesión para check-in"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default QRCheckIn;
