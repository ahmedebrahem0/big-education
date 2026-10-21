const origin = process.env.SITE_TEST_ORIGIN || "http://localhost:3000";
const paths = ["", "/about", "/solutions", "/solutions/educational-spaces", "/solutions/educational-media", "/emergency-education", "/contact"]; // legacy URLs redirect to anchors
let failed = 0;
for (const locale of ["en", "ar"]) {
  for (const path of paths) {
    const route = `/${locale}${path}`;
    const response = await fetch(`${origin}${route}`);
    const html = await response.text();
    const ok = response.status === 200 && html.includes(`lang="${locale}"`) && html.includes(`dir="${locale === "ar" ? "rtl" : "ltr"}"`);
    console.log(`${ok ? "PASS" : "FAIL"} ${route} (${response.status})`);
    if (!ok) failed++;
  }
}
const root = await fetch(origin, { redirect: "manual" });
const rootOk = [307, 308].includes(root.status) && root.headers.get("location") === "/en";
console.log(`${rootOk ? "PASS" : "FAIL"} root redirect`);
if (!rootOk) failed++;
process.exitCode = failed ? 1 : 0;
