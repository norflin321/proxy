"use client";
import styles from "./page.module.css";

export default function Home() {
	async function test() {
		// TEST 1
		{
			const body = JSON.stringify({ method: "GET", url: "https://example.com" });
			const res = await fetch("/api/proxy", { method: "POST", body });
			console.log("TEST 1:", await res.json());
		}

		// TEST 2
		{
			const body = JSON.stringify({ method: "GET", url: "https://api.sampleapis.com/beers/ale" })
			const res = await fetch("/api/proxy", { method: "POST", body });
			console.log("TEST 2:", await res.json());
		}

		// TEST 3
		{
			const body = JSON.stringify({
				method: "POST",
				url: "https://api.restful-api.dev/objects",
				body: { name: "Apple MacBook Pro 16", data: { year: 2019, price: 1849.99, "CPU model": "Intel Core i9", "Hard disk size": "1 TB" } },
				headers: { "Content-Type": "application/json" },
			});
			const res = await fetch("/api/proxy", { method: "POST", body });
			console.log("TEST 3:", await res.json());
		}
	}

  return (
    <main className={styles.main}>
      <button onClick={test}>Test</button>
    </main>
  );
}
