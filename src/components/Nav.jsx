"use server";
import { getLeagueBySlug } from "@/lib/queries";
import NavClientSide from "./NavClientSide";
const DEFAULT_NAV_LOGO = "/logoCities/lcsw.png";


export default async function Nav() {
    const leagues = await getLeagueBySlug();
    const cityNavItems = (leagues || []).map(({ slug, name, logo }) => {
      const normalizedSlug = (slug || "").toLowerCase();
      return {
        name: name || slug,
        href: slug ? `/competitions/${slug}` : "/",
        slug: normalizedSlug,
        logoSrc: logo || DEFAULT_NAV_LOGO,
      };
    });
    const defaultCities = [
    { name: "LSC", href: "/", slug: "esl", logoSrc: DEFAULT_NAV_LOGO },
    ...cityNavItems,
    { name: "", href: "", slug: "spacer", logoSrc: "" },
  ];


  return <NavClientSide defaultCities={defaultCities} />;
}



