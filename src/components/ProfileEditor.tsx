import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Camera, Trophy, Award } from "lucide-react";

interface Props { open: boolean; onOpenChange: (v: boolean) => void; }

const ProfileEditor = ({ open, onOpenChange }: Props) => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [points, setPoints] = useState(0);
  const [level, setLevel] = useState(1);
  const [badges, setBadges] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!open || !user) return;
    (async () => {
      const [{ data: profile }, { data: pts }, { data: ub }] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("user_points").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("user_badges").select("badges(*)").eq("user_id", user.id),
      ]);
      if (profile) {
        setDisplayName(profile.display_name || "");
        setBio(profile.bio || "");
        setAvatarUrl(profile.avatar_url);
      }
      if (pts) { setPoints(pts.points); setLevel(pts.level); }
      setBadges((ub || []).map((b: any) => b.badges).filter(Boolean));
    })();
  }, [open, user]);

  const handleAvatar = async (file: File) => {
    if (!user) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) { toast.error(error.message); setUploading(false); return; }
    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
    setAvatarUrl(pub.publicUrl);
    await supabase.from("profiles").upsert({ user_id: user.id, avatar_url: pub.publicUrl, display_name: displayName || user.email }, { onConflict: "user_id" });
    toast.success("Foto actualizada");
    setUploading(false);
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert(
      { user_id: user.id, display_name: displayName, bio, avatar_url: avatarUrl },
      { onConflict: "user_id" }
    );
    if (error) toast.error(error.message); else toast.success("Perfil guardado");
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md glass-panel-strong border-sovereign">
        <DialogHeader>
          <DialogTitle className="heritage-text">Mi Perfil Soberano</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="w-20 h-20 border-2 border-primary/40">
              <AvatarImage src={avatarUrl || undefined} />
              <AvatarFallback className="bg-muted text-lg">
                {(displayName || user?.email || "?").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <label className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1.5 cursor-pointer hover:opacity-90">
              <Camera className="w-3 h-3" />
              <input type="file" accept="image/*" className="hidden"
                onChange={(e) => e.target.files?.[0] && handleAvatar(e.target.files[0])}
                disabled={uploading} />
            </label>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 text-primary">
              <Trophy className="w-4 h-4" />
              <span className="heritage-text text-lg">Nivel {level}</span>
            </div>
            <div className="text-xs text-muted-foreground">{points} puntos soberanos</div>
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-rdm-gold transition-all"
                style={{ width: `${Math.min(100, (points % 100))}%` }} />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Nombre</label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Tu nombre" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Bio</label>
            <Input value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Breve descripción" />
          </div>
        </div>

        {badges.length > 0 && (
          <div>
            <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <Award className="w-3 h-3" /> Insignias ({badges.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {badges.map((b) => (
                <div key={b.id} className="glass-panel border-sovereign px-2 py-1 flex items-center gap-1.5">
                  <span className="text-base">{b.icon}</span>
                  <span className="text-[10px]">{b.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button onClick={save} disabled={saving} className="w-full">
          {saving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditor;
