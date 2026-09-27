export type CivicRole = "citizen" | "officer" | "admin";
export type CivicStatus = "NEW" | "UNDER REVIEW" | "ASSIGNED" | "IN PROGRESS" | "AWAITING CITIZEN VERIFICATION" | "RESOLVED" | "REOPENED" | "REJECTED";
export type CivicIssue = {
  id: string;
  title: string;
  category: string;
  location: string;
  ward: string;
  department: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  status: CivicStatus;
  age: string;
  citizen: string;
  description: string;
  confidence: number;
  lat: number;
  left: number;
  top: number;
};

export const departments = ["Road Maintenance", "Waste Management", "Water Supply", "Drainage", "Electrical", "Parks & Gardens", "Infrastructure", "Sanitation"];
export const categories = ["Road Damage / Pothole", "Garbage", "Drainage", "Water Leakage", "Streetlight", "Trees", "Infrastructure"];
const titles = ["Large pothole near school entrance", "Overflowing community bin", "Streetlight out on main road", "Water leaking onto footpath", "Blocked storm drain", "Damaged road surface", "Fallen tree blocking lane", "Roadside waste accumulation", "Broken pavement tiles", "Low water pressure reported"];
const places = ["FC Road, Pune", "Deccan Gymkhana, Pune", "Shivajinagar, Pune", "Kothrud, Pune", "Baner Road, Pune", "Camp, Pune", "Aundh, Pune", "JM Road, Pune"];
const statuses: CivicStatus[] = ["NEW", "UNDER REVIEW", "ASSIGNED", "IN PROGRESS", "AWAITING CITIZEN VERIFICATION", "RESOLVED", "REOPENED"];
const priorities: CivicIssue["priority"][] = ["Critical", "High", "High", "Medium", "Medium", "Low"];

export function createDemoIssues(): CivicIssue[] {
  return Array.from({ length: 100 }, (_, index) => {
    const n = index + 1;
    const title = titles[index % titles.length];
    return {
      id: `CIV-2026-${String(124 - index).padStart(5, "0")}`,
      title,
      category: categories[index % categories.length],
      location: places[index % places.length],
      ward: `Ward ${String((index % 18) + 1).padStart(2, "0")}`,
      department: departments[index % departments.length],
      priority: priorities[index % priorities.length],
      status: statuses[(index * 3) % statuses.length],
      age: index === 0 ? "18 min" : `${(n * 3) % 47 + 1}h`,
      citizen: ["Rahul Sharma", "Ananya Desai", "Aarav Kulkarni", "Meera Joshi", "Ishaan Patil"][index % 5],
      description: `${title} reported by a nearby resident. The issue is affecting daily movement and needs municipal attention.`,
      confidence: 88 + ((index * 7) % 11),
      lat: 18.50 + ((index * 13) % 70) / 1000,
      left: 10 + ((index * 29) % 80),
      top: 12 + ((index * 37) % 70),
    };
  });
}

export const initialNotifications = [
  { id: 1, title: "Your pothole report was assigned to Road Maintenance.", time: "12 min ago", unread: true },
  { id: 2, title: "Resolution submitted for CIV-2026-00118.", time: "1 hour ago", unread: true },
  { id: 3, title: "New high-priority road issue in Ward 12.", time: "3 hours ago", unread: false },
];