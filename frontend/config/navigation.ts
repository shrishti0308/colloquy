export interface NavSubItem {
  title: string;
  href: string;
  description?: string;
  icon?: any;
}

export interface NavItem {
  title: string;
  href?: string;
  subItems?: NavSubItem[];
}

export const NAVIGATION_ITEMS: NavItem[] = [
  {
    title: "Home",
    href: "/",
  },
  {
    title: "Dashboard",
    href: "/dashboard",
  },
  {
    title: "Problems",
    subItems: [
      {
        title: "All Problems",
        href: "/problems",
        description: "Browse all available coding problems",
      },
      {
        title: "My Submissions",
        href: "/problems/submissions",
        description: "View your problem submissions",
      },
    ],
  },
  {
    title: "Practice",
    subItems: [
      {
        title: "Mock Interviews",
        href: "/practice/mock",
        description: "Practice with mock interviews",
      },
      {
        title: "Interview Sessions",
        href: "/practice/sessions",
        description: "Your scheduled interview sessions",
      },
    ],
  },
];

// Pages where navbar should NOT be shown
export const NAVBAR_EXCLUDED_ROUTES = ["/interview", "/problem/[id]/solve"];

// Pages where footer should NOT be shown
export const FOOTER_EXCLUDED_ROUTES = [
  "/interview",
  "/problem/[id]/solve",
  "/practice/mock",
];
