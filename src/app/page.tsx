import { currentUser } from "@/lib/auth";
import { listUsers, readFamily } from "@/lib/db";
import { publicFamily } from "@/lib/domain";
import { dayKey } from "@/lib/model";
import { Portal } from "@/components/portal";
import { Welcome } from "@/components/welcome";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await currentUser();
  const family = readFamily();
  if (!family || !user) return <Welcome setup={!family} />;
  const members = user.role === "parent" ? listUsers() : [user];
  return <Portal snapshot={{ family: publicFamily(family, user), user, members, today: dayKey(family.settings.timezone) }} />;
}
