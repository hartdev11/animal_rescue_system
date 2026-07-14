"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Heart,
  Loader2,
  MapPin,
  PawPrint,
  Phone,
  RefreshCw,
  Stethoscope,
  Truck,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getClinicSession } from "@/components/clinic/clinic-login-form";
import {
  ANIMAL_CONDITIONS,
  CASE_STATUS_FLOW,
  CASE_STATUS_LABELS,
  CASE_STATUS_STYLES,
  getSpeciesLabel,
} from "@/lib/constants";
import { getCaseImageUrls } from "@/lib/case-images";
import { cn, formatDate, formatPhoneNumber } from "@/lib/utils";
import type { AnimalSpecies, CaseStatus, RescueCase } from "@/types";

const POLL_MS = 30_000;

type CaseRow = Omit<RescueCase, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

interface DashboardStats {
  newCases: number;
  acceptedCases: number;
  onTheWay: number;
  rescued: number;
  underTreatment: number;
  recovery: number;
  readyForAdoption: number;
  adopted: number;
  closedCases: number;
}

interface DashboardData {
  totalCases: number;
  activeCases: number;
  todayCases: number;
  stats: DashboardStats;
  recentCases: CaseRow[];
  urgentCases: CaseRow[];
}

const STAT_TO_STATUS: Record<keyof DashboardStats, CaseStatus> = {
  newCases: "NEW",
  acceptedCases: "ACCEPTED",
  onTheWay: "ON_THE_WAY",
  rescued: "RESCUED",
  underTreatment: "UNDER_TREATMENT",
  recovery: "RECOVERY",
  readyForAdoption: "READY_FOR_ADOPTION",
  adopted: "ADOPTED",
  closedCases: "CLOSED",
};

const WORK_GROUPS: {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  statuses: CaseStatus[];
  accent: string;
}[] = [
  {
    id: "intake",
    label: "รับเคส",
    description: "เคสใหม่และรอจัดการ",
    icon: AlertCircle,
    statuses: ["NEW", "ACCEPTED"],
    accent: "border-sky-200 bg-sky-50/60",
  },
  {
    id: "field",
    label: "ภาคสนาม",
    description: "ออกช่วยเหลือและนำกลับ",
    icon: Truck,
    statuses: ["ON_THE_WAY", "RESCUED"],
    accent: "border-amber-200 bg-amber-50/60",
  },
  {
    id: "care",
    label: "รักษาและฟื้นตัว",
    description: "ดูแลจนกว่าจะส่งมอบ",
    icon: Stethoscope,
    statuses: ["UNDER_TREATMENT", "RECOVERY", "READY_FOR_ADOPTION", "ADOPTED"],
    accent: "border-violet-200 bg-violet-50/60",
  },
  {
    id: "done",
    label: "เสร็จสิ้น",
    description: "ปิดเคสแล้ว",
    icon: CheckCircle2,
    statuses: ["CLOSED"],
    accent: "border-slate-200 bg-slate-50/60",
  },
];

function buildDashboardUrl(sessionProvince: string, showAllProvinces: boolean) {
  const params = new URLSearchParams();
  if (showAllProvinces) {
    params.set("all", "true");
  } else {
    params.set("province", sessionProvince);
  }
  return `/api/clinic/dashboard?${params.toString()}`;
}

function casesFilterHref(status?: CaseStatus) {
  return status ? `/clinic/cases?status=${status}` : "/clinic/cases";
}

function pct(part: number, total: number) {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}

function SummaryCard({
  label,
  value,
  sub,
  icon: Icon,
  href,
  highlight,
}: {
  label: string;
  value: number;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  highlight?: boolean;
}) {
  return (
    <Link href={href} className="group block">
      <Card
        className={cn(
          "h-full transition hover:border-emerald-300 hover:shadow-md",
          highlight && "border-amber-300 bg-amber-50/50 ring-1 ring-amber-200"
        )}
      >
        <CardContent className="flex items-start justify-between p-4">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight">{value}</p>
            {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
          </div>
          <div
            className={cn(
              "rounded-xl p-2.5",
              highlight ? "bg-amber-100 text-amber-700" : "bg-emerald-50 text-emerald-600"
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function CaseMiniRow({ c, detailed }: { c: CaseRow; detailed?: boolean }) {
  const condition = ANIMAL_CONDITIONS.find((x) => x.value === c.condition);
  const cover = getCaseImageUrls(c)[0];
  const styles = CASE_STATUS_STYLES[c.status];

  return (
    <Link
      href={`/clinic/cases/${c.caseNumber}`}
      className="group flex gap-3 rounded-xl border bg-white p-3 transition hover:border-emerald-300 hover:shadow-sm"
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border">
        {cover ? (
          <Image src={cover} alt="" fill className="object-cover" unoptimized />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100 text-[10px] text-gray-400">
            ไม่มีรูป
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm font-semibold text-emerald-700">
            {c.caseNumber}
          </span>
          <Badge className={`text-[10px] ${styles.badge}`}>
            {CASE_STATUS_LABELS[c.status].th}
          </Badge>
          {c.wantsToAdopt && (
            <Badge variant="outline" className="gap-1 text-[10px] text-pink-700">
              <Heart className="h-3 w-3" />
              รับเลี้ยงเอง
            </Badge>
          )}
        </div>
        <p className="mt-0.5 truncate text-xs text-gray-600">
          {condition?.labelTh}
          {c.species ? ` • ${getSpeciesLabel(c.species as AnimalSpecies)}` : ""} • {c.province}
        </p>
        {detailed ? (
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <User className="h-3 w-3" />
              {c.reporterName || "ไม่ระบุชื่อ"}
            </span>
            <span className="inline-flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {formatPhoneNumber(c.phoneNumber)}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {c.latitude.toFixed(4)}, {c.longitude.toFixed(4)}
            </span>
          </div>
        ) : (
          <p className="text-[11px] text-muted-foreground">
            {formatDate(new Date(c.createdAt))}
          </p>
        )}
      </div>
      <ArrowRight className="mt-4 h-4 w-4 shrink-0 text-gray-300 group-hover:text-emerald-500" />
    </Link>
  );
}

export function ClinicDashboard() {
  const session = getClinicSession();
  const province = session?.province ?? "";
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(Boolean(province));
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showAllProvinces, setShowAllProvinces] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  const fetchDashboard = useCallback(async () => {
    if (!province) return null;
    const res = await fetch(buildDashboardUrl(province, showAllProvinces), {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("โหลดไม่สำเร็จ");
    return res.json() as Promise<DashboardData>;
  }, [province, showAllProvinces]);

  const loadDashboard = useCallback(async () => {
    if (!province) return;
    setLoading(true);
    setLoadError(null);
    try {
      const result = await fetchDashboard();
      if (result) {
        setData(result);
        setLastSyncedAt(new Date());
      }
    } catch {
      setLoadError("เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [province, fetchDashboard]);

  useEffect(() => {
    if (!province) return;

    let cancelled = false;

    void (async () => {
      try {
        const result = await fetchDashboard();
        if (!cancelled && result) {
          setData(result);
          setLastSyncedAt(new Date());
          setLoadError(null);
        }
      } catch {
        if (!cancelled) setLoadError("เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [province, fetchDashboard]);

  useEffect(() => {
    if (!province) return;

    const interval = setInterval(() => {
      void (async () => {
        try {
          const result = await fetchDashboard();
          if (result) {
            setData(result);
            setLastSyncedAt(new Date());
            setLoadError(null);
          }
        } catch {
          setLoadError("เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ");
        }
      })();
    }, POLL_MS);

    return () => clearInterval(interval);
  }, [province, fetchDashboard]);

  const workflowSteps = useMemo(() => {
    if (!data) return [];
    return CASE_STATUS_FLOW.map((status) => {
      const key = Object.entries(STAT_TO_STATUS).find(([, s]) => s === status)?.[0] as
        | keyof DashboardStats
        | undefined;
      return {
        status,
        label: CASE_STATUS_LABELS[status].th,
        count: key ? data.stats[key] : 0,
        styles: CASE_STATUS_STYLES[status],
      };
    });
  }, [data]);

  const workGroups = useMemo(() => {
    if (!data) return [];
    return WORK_GROUPS.map((group) => {
      const count = group.statuses.reduce((sum, status) => {
        const key = Object.entries(STAT_TO_STATUS).find(([, s]) => s === status)?.[0] as
          | keyof DashboardStats
          | undefined;
        return sum + (key ? data.stats[key] : 0);
      }, 0);
      return { ...group, count };
    });
  }, [data]);

  if (!session) return null;

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="rounded-2xl border bg-linear-to-br from-emerald-50 via-white to-sky-50 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-emerald-700">พอร์ทัลคลินิก</p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{session.clinicName}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary" className="font-normal">
                {showAllProvinces ? "ทุกจังหวัด" : `จังหวัด${session.province}`}
              </Badge>
              {lastSyncedAt && (
                <span className="inline-flex items-center gap-1">
                  <Activity className="h-3.5 w-3.5 text-emerald-500" />
                  อัปเดต {formatDate(lastSyncedAt)}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadDashboard} disabled={loading}>
              <RefreshCw className={cn("mr-1.5 h-4 w-4", loading && "animate-spin")} />
              รีเฟรช
            </Button>
            <Button size="sm" asChild>
              <Link href="/clinic/cases">
                <ClipboardList className="mr-1.5 h-4 w-4" />
                รายการเคส
              </Link>
            </Button>
          </div>
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={showAllProvinces}
            onChange={(e) => setShowAllProvinces(e.target.checked)}
            className="rounded border-gray-300"
          />
          แสดงข้อมูลทุกจังหวัด (Demo)
        </label>
      </div>

      {loadError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          {loadError}
        </div>
      )}

      {loading && !data ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : data ? (
        <>
          {/* Action alert — สิ่งสำคัญสุด อยู่บนสุด */}
          {data.stats.newCases > 0 ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-amber-100 p-2">
                  <AlertCircle className="h-5 w-5 text-amber-700" />
                </div>
                <div>
                  <p className="font-semibold text-amber-900">
                    มี {data.stats.newCases} เคสใหม่รอรับ
                  </p>
                  <p className="text-sm text-amber-800/80">
                    ผู้แจ้งรอการตอบรับ — ควรตรวจสอบและรับเคสโดยเร็ว
                  </p>
                </div>
              </div>
              <Button size="sm" asChild className="bg-amber-600 hover:bg-amber-700">
                <Link href={casesFilterHref("NEW")}>
                  ไปรับเคส
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-800">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              ไม่มีเคสใหม่รอรับ — ระบบพร้อมรับเคสถัดไป
            </div>
          )}

          {/* KPI — 5 ตัว มีความหมายชัด */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <SummaryCard
              label="เคสทั้งหมด"
              value={data.totalCases}
              sub={`${pct(data.activeCases, data.totalCases)}% ยังดำเนินการ`}
              icon={PawPrint}
              href={casesFilterHref()}
            />
            <SummaryCard
              label="วันนี้"
              value={data.todayCases}
              sub="เคสที่เข้าระบบวันนี้"
              icon={CalendarDays}
              href={casesFilterHref()}
            />
            <SummaryCard
              label="กำลังดำเนินการ"
              value={data.activeCases}
              sub="ยังไม่ปิดเคส"
              icon={Activity}
              href={casesFilterHref()}
            />
            <SummaryCard
              label="รอรับเคส"
              value={data.stats.newCases}
              sub="ต้องดำเนินการก่อน"
              icon={AlertCircle}
              href={casesFilterHref("NEW")}
              highlight={data.stats.newCases > 0}
            />
            <SummaryCard
              label="ปิดเคสแล้ว"
              value={data.stats.closedCases}
              sub={`${pct(data.stats.closedCases, data.totalCases)}% ของทั้งหมด`}
              icon={CheckCircle2}
              href={casesFilterHref("CLOSED")}
            />
          </div>

          {/* Workflow strip — แทน 9 การ์ด + pipeline ซ้ำ */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">เส้นทางเคส</CardTitle>
              <CardDescription>
                คลิกแต่ละขั้นเพื่อดูรายการ — เรียงตามลำดับการช่วยเหลือ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {workflowSteps.map((step, i) => (
                  <div key={step.status} className="flex items-center gap-2">
                    <Link
                      href={casesFilterHref(step.status)}
                      className={cn(
                        "flex min-w-[88px] flex-col items-center rounded-xl border px-3 py-2.5 transition hover:shadow-md",
                        step.styles.card,
                        step.count > 0 && "ring-1 ring-inset ring-black/5"
                      )}
                    >
                      <span className={`text-lg font-bold tabular-nums ${step.styles.title}`}>
                        {step.count}
                      </span>
                      <span className="mt-0.5 text-center text-[11px] leading-tight text-muted-foreground">
                        {step.label}
                      </span>
                    </Link>
                    {i < workflowSteps.length - 1 && (
                      <ArrowRight className="hidden h-4 w-4 shrink-0 text-gray-300 sm:block" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-5 lg:grid-cols-5">
            {/* กลุ่มงาน — อ่านง่ายกว่า 9 การ์ดแยก */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">กลุ่มงาน</CardTitle>
                <CardDescription>แบ่งตามขั้นตอนการทำงานของคลินิก</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {workGroups.map((group) => {
                  const Icon = group.icon;
                  return (
                    <div
                      key={group.id}
                      className={cn("rounded-xl border p-3", group.accent)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-gray-600" />
                          <div>
                            <p className="text-sm font-medium">{group.label}</p>
                            <p className="text-xs text-muted-foreground">{group.description}</p>
                          </div>
                        </div>
                        <span className="text-2xl font-bold tabular-nums">{group.count}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {group.statuses.map((status) => {
                          const key = Object.entries(STAT_TO_STATUS).find(
                            ([, s]) => s === status
                          )?.[0] as keyof DashboardStats | undefined;
                          const count = key ? data.stats[key] : 0;
                          if (count === 0) return null;
                          return (
                            <Link
                              key={status}
                              href={casesFilterHref(status)}
                              className={cn(
                                "rounded-md px-2 py-0.5 text-[11px] transition hover:opacity-80",
                                CASE_STATUS_STYLES[status].badge
                              )}
                            >
                              {CASE_STATUS_LABELS[status].th} {count}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* เคสล่าสุด */}
            <Card className="lg:col-span-3">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base">เคสล่าสุด</CardTitle>
                  <CardDescription>5 รายการที่เพิ่งเข้าระบบ</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/clinic/cases">ดูทั้งหมด</Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.recentCases.length === 0 ? (
                  <div className="rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">
                    <PawPrint className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                    ยังไม่มีเคสในระบบ
                  </div>
                ) : (
                  data.recentCases.map((c) => <CaseMiniRow key={c.caseNumber} c={c} />)
                )}
              </CardContent>
            </Card>
          </div>

          {/* เคสใหม่ — รายละเอียดมากขึ้น */}
          {data.urgentCases.length > 0 && (
            <Card className="border-amber-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-amber-900">
                  <AlertCircle className="h-5 w-5" />
                  รายละเอียดเคสใหม่รอรับ
                </CardTitle>
                <CardDescription>
                  ข้อมูลผู้แจ้งและตำแหน่ง — คลิกเพื่อรับเคสหรือดูรายละเอียด
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2 md:grid-cols-2">
                {data.urgentCases.map((c) => (
                  <CaseMiniRow key={c.caseNumber} c={c} detailed />
                ))}
              </CardContent>
            </Card>
          )}
        </>
      ) : null}
    </div>
  );
}
