// ABOUTME: Recommendations page based on global RAS best practices
// ABOUTME: Shows improvement suggestions for existing protocols

import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { UI_STRINGS, type Language } from "@/lib/protocols";
import LanguageToggle from "@/components/LanguageToggle";

export const metadata = {
  title: "המלצות לשיפור - Pure Blue Fish",
  description: "המלצות לשיפור פרוטוקולים מבוסס על Best Practices בינלאומיים",
};

const content = {
  he: {
    title: "המלצות לשיפור פרוטוקולים",
    subtitle: "מבוסס על Best Practices מחוות RAS מצליחות בעולם",
    date: "פברואר 2026",
    sources:
      "The Fish Site, Global Seafood Alliance, FAO, Atlas Scientific, Merck Veterinary Manual, Mississippi State University Extension",
    executiveSummary: "סיכום מנהלים",
    executiveSummaryText:
      "הפרוטוקולים הקיימים מצוינים ומפורטים. להלן המלצות לשיפור נוסף מבוססות על סטנדרטים בינלאומיים:",
    sections: [
      {
        title: "מדידת חמצן",
        current: [
          "מדידות כל 2-4 שעות",
          "כיול יומי",
          "ערכי יעד ברורים",
        ],
        recommendations: [
          {
            title: "מדידות לילה נוספות",
            quote:
              '"Prudent managers measure dissolved oxygen concentration at night" - Global Seafood Alliance',
            details: "הוסיפו בדיקה ב-02:00-04:00 - זה השפל הקריטי, DO נמוך ביותר לפני הזריחה",
          },
          {
            title: "מדידה לפני ואחרי האכלה",
            quote: "האכלה יוצרת spike בצריכת חמצן",
            details:
              "מדידה 15 דקות לפני האכלה הראשונה, מדידה 30 דקות אחרי האכלה הגדולה ביותר",
          },
          {
            title: "התראות prediktיביות (AI)",
            quote: "הפרוטוקול הנוכחי מגיב לבעיות. עם מערכת ה-AI:",
            details:
              "זיהוי מגמת ירידה שעות לפני הגעה לסף, התראה על קצב שינוי מהיר (>0.2 mg/L/שעה)",
          },
          {
            title: "תיעוד סטורציה באחוזים",
            quote: "מומלץ לתעד גם % saturation ולא רק mg/L",
            details: "מאפשר השוואה בין טמפרטורות שונות, סטנדרט בינלאומי מקובל",
          },
        ],
      },
      {
        title: "מדידת CO2",
        current: [
          "בדיקה שבועית / יומית בצפיפות גבוהה",
          "מדידת Oxyguard",
          "חישוב מ-pH ואלקליניות",
        ],
        recommendations: [
          {
            title: "הגדרת סף קריטי ברור",
            quote:
              '"The limit of carbon dioxide for most cultured animals would be 15-20 mg/L" - The Fish Site',
            details: "סף אזהרה: 15 ppm, סף קריטי: 20 ppm, סימני מצוקה: 50 ppm",
          },
          {
            title: "קשר הדוק יותר בין CO2 לאוורור",
            quote: "CO2 גבוה + pH נמוך = מצב מסוכן",
            details: 'אם CO2 > 15 ppm, הגבר אוורור/turbulence מיד',
          },
          {
            title: "מדידה בזמני שיא",
            quote: "CO2 מצטבר בלילה ובשעות צפיפות גבוהה",
            details: "מומלץ: מדידה ב-06:00 (לפני זריחה) - זה השיא",
          },
        ],
      },
      {
        title: "דגימת אמוניה",
        current: [
          "דגימה יומית בצהריים",
          "בדיקת פילטר כניסה/יציאה",
          "חישוב NH3 רעילה",
        ],
        recommendations: [
          {
            title: "הוספת טבלת רעילות לפי pH וטמפרטורה",
            quote: '"Ammonia toxicity increases at higher pH levels" - Atlas Scientific',
            details:
              "pH 7.0, 25°C = NH3 0.6% מ-TAN; pH 8.0, 25°C = NH3 5.4% מ-TAN; pH 8.5, 30°C = NH3 15% מ-TAN",
          },
          {
            title: "בדיקה גם בבוקר המוקדם",
            quote: "בדיקת צהריים תופסת שיא אמוניה מהאכלות",
            details: "בדיקת בוקר (06:00) תופסת הצטברות לילית",
          },
          {
            title: "קורלציה עם FCR",
            quote: "אמוניה גבוהה יכולה להצביע על האכלת יתר או בעיית עיכול",
            details: 'אם אמוניה חורגת, בדוק FCR השבוע',
          },
        ],
      },
      {
        title: "האכלת דגים",
        current: ["10 האכלות ביום", "תצפית על התנהגות", "רישום חריגות"],
        recommendations: [
          {
            title: "מעקב FCR שבועי",
            quote: "Feed Conversion Ratio הוא המדד החשוב ביותר לרווחיות",
            details: "FCR = משקל מזון / עלייה במשקל. יעד: FCR < 1.5, אזהרה: FCR > 2.0",
          },
          {
            title: "התאמת כמות לטמפרטורה",
            quote:
              '"Fish\'s metabolic activities are influenced by water temperature" - Atlas Scientific',
            details:
              "< 18°C הפחת 30-50%; 18-22°C הפחת 10-20%; 22-28°C כמות רגילה; > 28°C הפחת 20-30%",
          },
          {
            title: "עצירת האכלה לפני טיפולים",
            quote: "כבר קיים (12 שעות)",
            details: "הוסיפו: גם לפני מיון/שקילה - צום 24 שעות. מונע סטרס ומשפר דיוק שקילה",
          },
        ],
      },
      {
        title: "אקלום דגים",
        current: [
          "גבולות קצב לכל פרמטר",
          "הוספת מים הדרגתית",
          "תצפית על התנהגות",
        ],
        recommendations: [
          {
            title: "הוספת זמן התאוששות",
            quote:
              '"Handling and transport have been shown to reduce disease resistance and recovery may take weeks" - The Fish Site',
            details: "לאחר אקלום - אל תאכילו 24-48 שעות, אל תטפלו/תמיינו למשך שבוע",
          },
          {
            title: "מדידת סטרס (אופציונלי)",
            quote: "בחוות מתקדמות מודדים קורטיזול בדם או תצפית על נשימה",
            details: "נשימה מהירה = סטרס",
          },
          {
            title: "בידוד ממושך",
            quote:
              '"Quarantine is one of the most important biosecurity measures" - Merck Manual',
            details: "קרנטינה מינימלית: 14 יום, מומלץ: 21-30 יום, בדיקות בריאות לפני שחרור",
          },
        ],
      },
      {
        title: "Biosecurity",
        current: ["חיטוי ידיים", "ציוד ייעודי", "נהלי ניקיון"],
        recommendations: [
          {
            title: "פרוטוקול מקלחות",
            quote:
              '"Workers can reduce the risk of spreading diseases if they shower and change clothing when moving between areas" - MSU Extension',
            details:
              "מעבר קרנטינה לפיטום = מקלחת + החלפת בגדים, כניסת מבקרים = חלוק + כיסוי נעליים",
          },
          {
            title: "יומן מבקרים",
            quote: "חשוב לעקיבות במקרה של התפרצות",
            details: "תיעוד: תאריך, שם, ארגון, איזורים ביקר, חתימה",
          },
          {
            title: "Footbath בכניסה לכל אזור",
            quote: "סטנדרט בחוות מובילות",
            details: "מחליפים תמיסה יומית, ריכוז חיטוי מתאים",
          },
          {
            title: "הפרדת ציוד לפי אזור",
            quote: "כבר קיים, אבל הוסיפו צבע-קוד",
            details: "אדום=קרנטינה, ירוק=פיטום. אין העברת ציוד בין אזורים בשום מצב",
          },
        ],
      },
    ],
    generalRecommendations: [
      {
        title: "דיגיטציה ואוטומציה",
        items: [
          "כל הרישומים לאפליקציה/טאבלט",
          "התראות אוטומטיות על חריגות",
          "דשבורד מרכזי לביולוג",
        ],
      },
      {
        title: "תרגילי חירום",
        items: [
          "תרגיל כשל חמצן - רבעוני",
          "תרגיל התפרצות מחלה - חצי-שנתי",
          "סקירת נהלים - שנתי",
        ],
      },
      {
        title: "למידה מתמדת",
        items: [
          "סקירת אירועים (post-mortem) אחרי כל תקלה",
          "שיתוף ידע בין משמרות",
          "עדכון פרוטוקולים לפי לקחים",
        ],
      },
    ],
    kpis: [
      { metric: "FCR", target: "< 1.5", frequency: "שבועי" },
      { metric: "תמותה יומית", target: "< 0.1%", frequency: "יומי" },
      { metric: "SGR", target: "> 2%", frequency: "דו-שבועי" },
      { metric: "DO מינימלי", target: "> 5 mg/L", frequency: "רציף" },
    ],
    backToProtocols: "חזרה לפרוטוקולים",
    currentState: "מה יש עכשיו",
    improvementSuggestions: "המלצות לשיפור",
    generalRecs: "המלצות כלליות",
    kpisTitle: "KPIs לניהול",
    metric: "מדד",
    target: "יעד",
    frequency: "תדירות",
  },
  en: {
    title: "Protocol Improvement Recommendations",
    subtitle: "Based on Best Practices from successful RAS farms worldwide",
    date: "February 2026",
    sources:
      "The Fish Site, Global Seafood Alliance, FAO, Atlas Scientific, Merck Veterinary Manual, Mississippi State University Extension",
    executiveSummary: "Executive Summary",
    executiveSummaryText:
      "The existing protocols are excellent and detailed. Below are recommendations for further improvement based on international standards:",
    sections: [
      {
        title: "Oxygen Measurement",
        current: [
          "Measurements every 2-4 hours",
          "Daily calibration",
          "Clear target values",
        ],
        recommendations: [
          {
            title: "Additional Night Measurements",
            quote:
              '"Prudent managers measure dissolved oxygen concentration at night" - Global Seafood Alliance',
            details: "Add check at 02:00-04:00 - this is the critical low point, lowest DO before sunrise",
          },
          {
            title: "Measurement Before and After Feeding",
            quote: "Feeding creates a spike in oxygen consumption",
            details:
              "Measure 15 minutes before first feeding, measure 30 minutes after the largest feeding",
          },
          {
            title: "Predictive Alerts (AI)",
            quote: "Current protocol reacts to problems. With AI system:",
            details:
              "Identify declining trends hours before threshold, alert on rapid change rate (>0.2 mg/L/hour)",
          },
          {
            title: "Document Saturation Percentage",
            quote: "Recommended to record % saturation, not just mg/L",
            details: "Enables comparison between different temperatures, accepted international standard",
          },
        ],
      },
      {
        title: "CO2 Measurement",
        current: [
          "Weekly/daily check at high density",
          "Oxyguard measurement",
          "Calculation from pH and alkalinity",
        ],
        recommendations: [
          {
            title: "Define Clear Critical Threshold",
            quote:
              '"The limit of carbon dioxide for most cultured animals would be 15-20 mg/L" - The Fish Site',
            details: "Warning threshold: 15 ppm, Critical threshold: 20 ppm, Distress signs: 50 ppm",
          },
          {
            title: "Tighter Link Between CO2 and Aeration",
            quote: "High CO2 + low pH = dangerous situation",
            details: "If CO2 > 15 ppm, increase aeration/turbulence immediately",
          },
          {
            title: "Measure at Peak Times",
            quote: "CO2 accumulates at night and during high density hours",
            details: "Recommended: measure at 06:00 (before sunrise) - this is the peak",
          },
        ],
      },
      {
        title: "Ammonia Sampling",
        current: [
          "Daily sampling at noon",
          "Filter inlet/outlet check",
          "Toxic NH3 calculation",
        ],
        recommendations: [
          {
            title: "Add Toxicity Table by pH and Temperature",
            quote: '"Ammonia toxicity increases at higher pH levels" - Atlas Scientific',
            details:
              "pH 7.0, 25°C = NH3 0.6% of TAN; pH 8.0, 25°C = NH3 5.4% of TAN; pH 8.5, 30°C = NH3 15% of TAN",
          },
          {
            title: "Also Check Early Morning",
            quote: "Noon check catches ammonia peak from feedings",
            details: "Morning check (06:00) catches overnight accumulation",
          },
          {
            title: "Correlation with FCR",
            quote: "High ammonia may indicate overfeeding or digestion issues",
            details: "If ammonia exceeds limits, check this week's FCR",
          },
        ],
      },
      {
        title: "Fish Feeding",
        current: ["10 feedings per day", "Behavior observation", "Recording anomalies"],
        recommendations: [
          {
            title: "Weekly FCR Tracking",
            quote: "Feed Conversion Ratio is the most important metric for profitability",
            details: "FCR = feed weight / weight gain. Target: FCR < 1.5, Warning: FCR > 2.0",
          },
          {
            title: "Adjust Amount by Temperature",
            quote:
              '"Fish\'s metabolic activities are influenced by water temperature" - Atlas Scientific',
            details:
              "< 18°C reduce 30-50%; 18-22°C reduce 10-20%; 22-28°C normal amount; > 28°C reduce 20-30%",
          },
          {
            title: "Stop Feeding Before Treatments",
            quote: "Already exists (12 hours)",
            details: "Add: also before sorting/weighing - 24 hour fast. Prevents stress and improves weighing accuracy",
          },
        ],
      },
      {
        title: "Fish Acclimation",
        current: [
          "Rate limits for each parameter",
          "Gradual water addition",
          "Behavior observation",
        ],
        recommendations: [
          {
            title: "Add Recovery Time",
            quote:
              '"Handling and transport have been shown to reduce disease resistance and recovery may take weeks" - The Fish Site',
            details: "After acclimation - don't feed for 24-48 hours, don't treat/sort for a week",
          },
          {
            title: "Stress Measurement (Optional)",
            quote: "Advanced farms measure blood cortisol or observe respiration",
            details: "Fast breathing = stress",
          },
          {
            title: "Extended Isolation",
            quote:
              '"Quarantine is one of the most important biosecurity measures" - Merck Manual',
            details: "Minimum quarantine: 14 days, Recommended: 21-30 days, health checks before release",
          },
        ],
      },
      {
        title: "Biosecurity",
        current: ["Hand sanitization", "Dedicated equipment", "Cleaning procedures"],
        recommendations: [
          {
            title: "Shower Protocol",
            quote:
              '"Workers can reduce the risk of spreading diseases if they shower and change clothing when moving between areas" - MSU Extension',
            details:
              "Quarantine to fattening transition = shower + change clothes, Visitor entry = gown + disposable shoe covers",
          },
          {
            title: "Visitor Log",
            quote: "Important for traceability in case of outbreak",
            details: "Document: date, name, organization, areas visited, signature",
          },
          {
            title: "Footbath at Each Area Entrance",
            quote: "Standard at leading farms",
            details: "Change solution daily, appropriate disinfectant concentration",
          },
          {
            title: "Equipment Separation by Area",
            quote: "Already exists, but add color-coding",
            details: "Red=quarantine, Green=fattening. No equipment transfer between areas under any circumstances",
          },
        ],
      },
    ],
    generalRecommendations: [
      {
        title: "Digitization and Automation",
        items: [
          "All records to app/tablet",
          "Automatic alerts for deviations",
          "Central dashboard for biologist",
        ],
      },
      {
        title: "Emergency Drills",
        items: [
          "Oxygen failure drill - quarterly",
          "Disease outbreak drill - semi-annually",
          "Procedure review - annually",
        ],
      },
      {
        title: "Continuous Learning",
        items: [
          "Event review (post-mortem) after each incident",
          "Knowledge sharing between shifts",
          "Protocol updates based on lessons learned",
        ],
      },
    ],
    kpis: [
      { metric: "FCR", target: "< 1.5", frequency: "Weekly" },
      { metric: "Daily mortality", target: "< 0.1%", frequency: "Daily" },
      { metric: "SGR", target: "> 2%", frequency: "Bi-weekly" },
      { metric: "Minimum DO", target: "> 5 mg/L", frequency: "Continuous" },
    ],
    backToProtocols: "Back to Protocols",
    currentState: "Current State",
    improvementSuggestions: "Improvement Suggestions",
    generalRecs: "General Recommendations",
    kpisTitle: "Management KPIs",
    metric: "Metric",
    target: "Target",
    frequency: "Frequency",
  },
};

export default async function RecommendationsPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const sp = await searchParams;
  const cookieStore = await cookies();
  const cookieLang = cookieStore.get("lang")?.value;
  const lang = (sp.lang || cookieLang || "he") as Language;
  const ui = UI_STRINGS[lang];
  const c = content[lang];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm print:hidden">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href={`/?lang=${lang}`} className="flex items-center gap-4">
            <Image
              src="/logo.png"
              alt="Pure Blue Fish"
              width={100}
              height={40}
              className="h-10 w-auto"
            />
          </Link>
          <div className="flex items-center gap-4">
            <LanguageToggle currentLang={lang} />
            <Link
              href={`/?lang=${lang}`}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
            >
              {c.backToProtocols}
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{c.title}</h1>
          <p className="text-gray-600">{c.subtitle}</p>
          <p className="text-sm text-gray-400 mt-2">
            {c.date} | {c.sources}
          </p>
        </div>

        {/* Executive Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-3">{c.executiveSummary}</h2>
          <p className="text-gray-700 mb-4">{c.executiveSummaryText}</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-blue-200">
                  <th className="text-start py-2 px-3">{lang === "he" ? "תחום" : "Area"}</th>
                  <th className="text-start py-2 px-3">
                    {lang === "he" ? "עיקרי ההמלצות" : "Key Recommendations"}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-blue-100">
                  <td className="py-2 px-3">{lang === "he" ? "חמצן" : "Oxygen"}</td>
                  <td className="py-2 px-3">
                    {lang === "he"
                      ? "הוספת מדידות לילה + התראות אוטומטיות"
                      : "Add night measurements + automatic alerts"}
                  </td>
                </tr>
                <tr className="border-b border-blue-100">
                  <td className="py-2 px-3">{lang === "he" ? "האכלה" : "Feeding"}</td>
                  <td className="py-2 px-3">
                    {lang === "he"
                      ? "מעקב FCR + אופטימיזציה לפי טמפרטורה"
                      : "FCR tracking + temperature optimization"}
                  </td>
                </tr>
                <tr className="border-b border-blue-100">
                  <td className="py-2 px-3">Biosecurity</td>
                  <td className="py-2 px-3">
                    {lang === "he"
                      ? "הוספת פרוטוקול מקלחות + תיעוד מבקרים"
                      : "Add shower protocol + visitor documentation"}
                  </td>
                </tr>
                <tr className="border-b border-blue-100">
                  <td className="py-2 px-3">{lang === "he" ? "אקלום" : "Acclimation"}</td>
                  <td className="py-2 px-3">
                    {lang === "he"
                      ? "הוספת מדידת סטרס (קורטיזול)"
                      : "Add stress measurement (cortisol)"}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3">{lang === "he" ? "חירום" : "Emergency"}</td>
                  <td className="py-2 px-3">
                    {lang === "he" ? "הוספת תרחישי תרגול" : "Add drill scenarios"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Sections */}
        {c.sections.map((section, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold mb-4">{section.title}</h2>

            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                {c.currentState}
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {section.current.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">
                {c.improvementSuggestions}
              </h3>
              <div className="space-y-4">
                {section.recommendations.map((rec, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium mb-1">{rec.title}</h4>
                    <p className="text-sm text-gray-500 italic mb-2">{rec.quote}</p>
                    <p className="text-sm text-gray-700">{rec.details}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* General Recommendations */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">{c.generalRecs}</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {c.generalRecommendations.map((rec, idx) => (
              <div key={idx} className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium mb-2">{rec.title}</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  {rec.items.map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* KPIs */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">{c.kpisTitle}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-start py-2 px-3">{c.metric}</th>
                  <th className="text-start py-2 px-3">{c.target}</th>
                  <th className="text-start py-2 px-3">{c.frequency}</th>
                </tr>
              </thead>
              <tbody>
                {c.kpis.map((kpi, idx) => (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="py-2 px-3 font-medium">{kpi.metric}</td>
                    <td className="py-2 px-3">{kpi.target}</td>
                    <td className="py-2 px-3">{kpi.frequency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
