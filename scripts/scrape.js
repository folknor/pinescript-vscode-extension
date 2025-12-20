#!/usr/bin/env node

/**
 * Pine Script v6 Documentation Scraper (Puppeteer Version)
 *
 * This script scrapes detailed information for each Pine Script v6 function,
 * including parameters, return types, descriptions, and examples.
 *
 * Uses Puppeteer for lightweight browser automation.
 *
 * Usage: node scripts/scrape.js [input-file] [output-file]
 * Default input: v6/raw/v6-language-constructs.json
 * Default output: v6/raw/complete-v6-details.json
 */

const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const BASE_URL = "https://www.tradingview.com/pine-script-reference/v6/";
const INPUT_FILE =
	process.argv[2] ||
	path.join(__dirname, "../v6/raw/v6-language-constructs.json");
const OUTPUT_FILE =
	process.argv[3] || path.join(__dirname, "../v6/raw/complete-v6-details.json");
const CACHE_DIR = path.join(__dirname, "../.cache/function-details");
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

function getCacheFilePath(functionName) {
	const safeName = functionName.replace(/[^a-zA-Z0-9]/g, "_");
	return path.join(CACHE_DIR, `${safeName}.json`);
}

function isCacheValid(cacheFilePath) {
	if (!fs.existsSync(cacheFilePath)) {
		return false;
	}

	const stats = fs.statSync(cacheFilePath);
	const age = Date.now() - stats.mtime.getTime();
	return age < CACHE_TTL;
}

function getCachedData(functionName) {
	const cacheFilePath = getCacheFilePath(functionName);

	if (!isCacheValid(cacheFilePath)) {
		return null;
	}

	try {
		const cachedData = JSON.parse(fs.readFileSync(cacheFilePath, "utf8"));
		console.log(`📋 Using cached data for: ${functionName}`);
		return cachedData;
	} catch (_error) {
		console.log(`⚠️  Invalid cache for ${functionName}, will re-scrape`);
		return null;
	}
}

function saveToCache(functionName, data) {
	const cacheFilePath = getCacheFilePath(functionName);

	// Ensure cache directory exists
	if (!fs.existsSync(CACHE_DIR)) {
		fs.mkdirSync(CACHE_DIR, { recursive: true });
	}

	try {
		fs.writeFileSync(cacheFilePath, JSON.stringify(data, null, 2), "utf8");
	} catch (error) {
		console.log(`⚠️  Failed to cache ${functionName}: ${error.message}`);
	}
}

async function scrapeFunctionDetails(functionName, useCache = true) {
	// Check cache first
	if (useCache) {
		const cachedData = getCachedData(functionName);
		if (cachedData) {
			return cachedData;
		}
	}

	let browser;
	try {
		// Launch Puppeteer with optimized settings
		browser = await puppeteer.launch({
			headless: true,
			args: [
				"--no-sandbox",
				"--disable-setuid-sandbox",
				"--disable-dev-shm-usage",
				"--disable-web-security",
				"--disable-features=IsolateOrigins,site-per-process",
			],
		});

		const page = await browser.newPage();

		// Optimize page for speed
		await page.setRequestInterception(true);
		page.on("request", (request) => {
			const resourceType = request.resourceType();
			if (["image", "stylesheet", "font", "media"].includes(resourceType)) {
				request.abort();
			} else {
				request.continue();
			}
		});

		// Construct function URL (e.g., https://www.tradingview.com/pine-script-reference/v6/fun_ta_sma.html)
		const functionUrl = `${BASE_URL}fun_${functionName.replace(".", "_").replace(/[()]/g, "")}.html`;

		console.log(`🔍 Scraping: ${functionName} -> ${functionUrl}`);

		await page.goto(functionUrl, {
			waitUntil: "networkidle2",
			timeout: 30000,
		});

		const details = await page.evaluate(() => {
			const result = {
				name: "",
				syntax: "",
				description: "",
				parameters: [],
				returns: "",
				example: "",
				namespace: "",
				category: "",
			};

			// Extract function name from page title or header
			const titleElement = document.querySelector(
				"h1, .function-name, .page-title, .title",
			);
			if (titleElement) {
				result.name = titleElement.textContent?.trim() || "";
			}

			// Extract syntax
			const syntaxElements = [
				".function-syntax",
				".syntax",
				"code.syntax",
				".function-signature",
				"pre code",
			];

			for (const selector of syntaxElements) {
				const element = document.querySelector(selector);
				if (element) {
					result.syntax = element.textContent?.trim() || "";
					break;
				}
			}

			// Extract description
			const descElements = [
				".function-description",
				".description",
				".intro",
				".summary",
				"p:first-child",
				".function-overview",
			];

			for (const selector of descElements) {
				const element = document.querySelector(selector);
				if (element?.textContent?.trim()) {
					result.description = element.textContent.trim();
					break;
				}
			}

			// Extract parameters
			const paramElements = [
				".parameter-list .parameter",
				".params .param",
				".arguments .argument",
				"table.params tr",
				".function-parameters tr",
			];

			for (const selector of paramElements) {
				const elements = document.querySelectorAll(selector);
				if (elements.length > 0) {
					elements.forEach((row) => {
						const nameEl = row.querySelector(
							".param-name, .name, td:first-child, th:first-child",
						);
						const typeEl = row.querySelector(
							".param-type, .type, td:nth-child(2), th:nth-child(2)",
						);
						const descEl = row.querySelector(
							".param-description, .description, td:last-child, td:nth-child(3)",
						);

						if (nameEl?.textContent?.trim()) {
							const param = {
								name: nameEl.textContent.trim(),
								type: typeEl?.textContent?.trim() || "",
								description: descEl?.textContent?.trim() || "",
								optional: false,
								required: true,
							};

							// Check if parameter is optional (contains ?, brackets, or specific text)
							const paramText =
								nameEl.textContent + (descEl?.textContent || "");
							if (
								paramText.includes("?") ||
								paramText.includes("optional") ||
								result.syntax.includes(`[${param.name}]`) ||
								result.syntax.includes(`${param.name}?`)
							) {
								param.optional = true;
								param.required = false;
							}

							result.parameters.push(param);
						}
					});
					break;
				}
			}

			// Extract return type
			const returnElements = [
				".return-type",
				".returns",
				".function-return",
				".return-description",
			];

			for (const selector of returnElements) {
				const element = document.querySelector(selector);
				if (element) {
					result.returns = element.textContent?.trim() || "";
					break;
				}
			}

			// If no explicit return type found, try to extract from syntax
			if (!result.returns && result.syntax.includes("→")) {
				const match = result.syntax.match(/→\s*([^\n]+)/);
				if (match) {
					result.returns = match[1].trim();
				}
			}

			// Extract example
			const exampleElements = [
				".example-code",
				".example pre code",
				".code-example pre code",
				".usage-example code",
			];

			for (const selector of exampleElements) {
				const element = document.querySelector(selector);
				if (element?.textContent?.trim()) {
					result.example = element.textContent.trim();
					break;
				}
			}

			// Extract namespace and category from URL or breadcrumbs
			if (window.location.href.includes("/fun_")) {
				const urlParts = window.location.href.split("/");
				const filename = urlParts[urlParts.length - 1];
				const namespaceMatch = filename.match(/fun_(.+?)_/);
				if (namespaceMatch) {
					result.namespace = namespaceMatch[1];
				}
			}

			// Extract category from breadcrumbs or sidebar
			const categoryElements = [
				".breadcrumb a:last-child",
				".category",
				".section",
				".sidebar .active",
			];

			for (const selector of categoryElements) {
				const element = document.querySelector(selector);
				if (element && element.textContent?.trim()) {
					result.category = element.textContent.trim();
					break;
				}
			}

			return result;
		});

		await browser.close();

		// Save to cache if successful
		if (details) {
			saveToCache(functionName, details);
		}

		return details;
	} catch (error) {
		console.log(`⚠️  Failed to scrape ${functionName}: ${error.message}`);
		if (browser) {
			await browser.close();
		}
		return null;
	}
}

async function scrapeAllFunctions(forceRefresh = false) {
	console.log(
		"🚀 Starting Pine Script v6 function details scrape (Puppeteer)...",
	);
	console.log(`📁 Input: ${INPUT_FILE}`);
	console.log(`📁 Output: ${OUTPUT_FILE}`);
	console.log(`📁 Cache: ${CACHE_DIR}`);
	console.log(`⏰ Cache TTL: ${CACHE_TTL / (60 * 60 * 1000)} hours`);
	console.log(`🔄 Force refresh: ${forceRefresh}`);

	// Read input file
	if (!fs.existsSync(INPUT_FILE)) {
		console.error(`❌ Input file not found: ${INPUT_FILE}`);
		process.exit(1);
	}

	const inputData = JSON.parse(fs.readFileSync(INPUT_FILE, "utf8"));
	const functionNames = inputData.functions?.items || [];

	if (functionNames.length === 0) {
		console.error(
			"❌ No functions found in input file. Run crawl script first.",
		);
		process.exit(1);
	}

	console.log(`📋 Found ${functionNames.length} functions to process`);

	// Analyze cache status
	const functionsToScrape = [];
	const functionsFromCache = [];

	if (!forceRefresh) {
		for (const funcName of functionNames) {
			const cacheFilePath = getCacheFilePath(funcName);
			if (isCacheValid(cacheFilePath)) {
				functionsFromCache.push(funcName);
			} else {
				functionsToScrape.push(funcName);
			}
		}
	} else {
		functionsToScrape.push(...functionNames);
	}

	console.log(`📊 Cache analysis:`);
	console.log(`   From cache: ${functionsFromCache.length}`);
	console.log(`   To scrape: ${functionsToScrape.length}`);

	const allDetails = {
		metadata: {
			extractedAt: new Date().toISOString(),
			source: BASE_URL,
			totalFunctions: functionNames.length,
			successfulScrapes: 0,
			failedScrapes: 0,
			cachedResults: functionsFromCache.length,
			forceRefresh,
			method: "Puppeteer",
		},
		functions: {},
	};

	// Load cached data first
	console.log("📋 Loading cached data...");
	for (const funcName of functionsFromCache) {
		const cachedData = getCachedData(funcName);
		if (cachedData) {
			allDetails.functions[funcName] = cachedData;
			allDetails.metadata.successfulScrapes++;
		}
	}

	// Scrape new/updated functions
	if (functionsToScrape.length > 0) {
		console.log("🔍 Scraping new/updated functions...");

		// Scrape functions in smaller batches to avoid memory issues
		const batchSize = 5; // Smaller batch size for Puppeteer
		for (let i = 0; i < functionsToScrape.length; i += batchSize) {
			const batch = functionsToScrape.slice(i, i + batchSize);
			console.log(
				`📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(functionsToScrape.length / batchSize)}`,
			);

			// Process batch sequentially to avoid resource conflicts
			for (const funcName of batch) {
				const details = await scrapeFunctionDetails(funcName, !forceRefresh);
				if (details) {
					allDetails.functions[funcName] = details;
					allDetails.metadata.successfulScrapes++;
				} else {
					allDetails.metadata.failedScrapes++;
				}
				// Add delay between requests
				await new Promise((resolve) => setTimeout(resolve, 1000));
			}

			// Longer delay between batches
			console.log("  Waiting 3 seconds between batches...");
			await new Promise((resolve) => setTimeout(resolve, 3000));
		}
	}

	// Ensure output directory exists
	const outputDir = path.dirname(OUTPUT_FILE);
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true });
	}

	// Save results
	fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allDetails, null, 2), "utf8");

	console.log("✅ Scrape completed successfully!");
	console.log(`📊 Results:`);
	console.log(`   Total functions: ${allDetails.metadata.totalFunctions}`);
	console.log(`   From cache: ${allDetails.metadata.cachedResults}`);
	console.log(
		`   Freshly scraped: ${allDetails.metadata.successfulScrapes - allDetails.metadata.cachedResults}`,
	);
	console.log(`   Successful: ${allDetails.metadata.successfulScrapes}`);
	console.log(`   Failed: ${allDetails.metadata.failedScrapes}`);
	console.log(`   Method: ${allDetails.metadata.method}`);
	console.log(`💾 Saved to: ${OUTPUT_FILE}`);
}

// Run if called directly
if (require.main === module) {
	const forceRefresh =
		process.argv.includes("--force") || process.argv.includes("-f");
	scrapeAllFunctions(forceRefresh).catch(console.error);
}

module.exports = { scrapeFunctionDetails, scrapeAllFunctions };
