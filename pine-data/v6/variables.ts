/**
 * Pine Script V6 Built-in Variables
 * Auto-generated from TradingView documentation
 * Generated: 2025-12-23T22:02:17.732Z
 * Total: 80 variables
 */

import type { PineVariable } from "../schema/types";

/**
 * All v6 built-in variables
 */
export const VARIABLES: PineVariable[] = [
  {
    "name": "ask",
    "type": "series<float>",
    "qualifier": "series",
    "description": "Built-in variable: ask"
  },
  {
    "name": "bar_index",
    "type": "series<int>",
    "qualifier": "series",
    "description": "Built-in variable: bar_index"
  },
  {
    "name": "bid",
    "type": "series<float>",
    "qualifier": "series",
    "description": "Built-in variable: bid"
  },
  {
    "name": "close",
    "type": "series<float>",
    "qualifier": "series",
    "description": "Built-in variable: close"
  },
  {
    "name": "dayofmonth",
    "type": "series<int>",
    "qualifier": "series",
    "description": "Built-in variable: dayofmonth"
  },
  {
    "name": "dayofweek",
    "type": "series<int>",
    "qualifier": "series",
    "description": "Built-in variable: dayofweek"
  },
  {
    "name": "high",
    "type": "series<float>",
    "qualifier": "series",
    "description": "Built-in variable: high"
  },
  {
    "name": "hl2",
    "type": "series<float>",
    "qualifier": "series",
    "description": "Built-in variable: hl2"
  },
  {
    "name": "hlc3",
    "type": "series<float>",
    "qualifier": "series",
    "description": "Built-in variable: hlc3"
  },
  {
    "name": "hlcc4",
    "type": "series<float>",
    "qualifier": "series",
    "description": "Built-in variable: hlcc4"
  },
  {
    "name": "hour",
    "type": "series<int>",
    "qualifier": "series",
    "description": "Built-in variable: hour"
  },
  {
    "name": "last_bar_index",
    "type": "series<int>",
    "qualifier": "series",
    "description": "Built-in variable: last_bar_index"
  },
  {
    "name": "last_bar_time",
    "type": "series<int>",
    "qualifier": "series",
    "description": "Built-in variable: last_bar_time"
  },
  {
    "name": "low",
    "type": "series<float>",
    "qualifier": "series",
    "description": "Built-in variable: low"
  },
  {
    "name": "minute",
    "type": "series<int>",
    "qualifier": "series",
    "description": "Built-in variable: minute"
  },
  {
    "name": "month",
    "type": "series<int>",
    "qualifier": "series",
    "description": "Built-in variable: month"
  },
  {
    "name": "na",
    "type": "const<na>",
    "qualifier": "const",
    "description": "Built-in variable: na"
  },
  {
    "name": "ohlc4",
    "type": "series<float>",
    "qualifier": "series",
    "description": "Built-in variable: ohlc4"
  },
  {
    "name": "open",
    "type": "series<float>",
    "qualifier": "series",
    "description": "Built-in variable: open"
  },
  {
    "name": "second",
    "type": "series<int>",
    "qualifier": "series",
    "description": "Built-in variable: second"
  },
  {
    "name": "time",
    "type": "series<int>",
    "qualifier": "series",
    "description": "Built-in variable: time"
  },
  {
    "name": "time_close",
    "type": "series<int>",
    "qualifier": "series",
    "description": "Built-in variable: time_close"
  },
  {
    "name": "time_tradingday",
    "type": "series<int>",
    "qualifier": "series",
    "description": "Built-in variable: time_tradingday"
  },
  {
    "name": "timenow",
    "type": "series<int>",
    "qualifier": "series",
    "description": "Built-in variable: timenow"
  },
  {
    "name": "volume",
    "type": "series<float>",
    "qualifier": "series",
    "description": "Built-in variable: volume"
  },
  {
    "name": "weekofyear",
    "type": "series<int>",
    "qualifier": "series",
    "description": "Built-in variable: weekofyear"
  },
  {
    "name": "year",
    "type": "series<int>",
    "qualifier": "series",
    "description": "Built-in variable: year"
  },
  {
    "name": "syminfo.tickerid",
    "type": "simple<string>",
    "qualifier": "simple",
    "description": "Ticker ID with exchange prefix",
    "namespace": "syminfo"
  },
  {
    "name": "syminfo.ticker",
    "type": "simple<string>",
    "qualifier": "simple",
    "description": "Ticker symbol without exchange",
    "namespace": "syminfo"
  },
  {
    "name": "syminfo.prefix",
    "type": "simple<string>",
    "qualifier": "simple",
    "description": "Exchange prefix",
    "namespace": "syminfo"
  },
  {
    "name": "syminfo.type",
    "type": "simple<string>",
    "qualifier": "simple",
    "description": "Symbol type (stock, forex, crypto, etc.)",
    "namespace": "syminfo"
  },
  {
    "name": "syminfo.session",
    "type": "simple<string>",
    "qualifier": "simple",
    "description": "Session type",
    "namespace": "syminfo"
  },
  {
    "name": "syminfo.timezone",
    "type": "simple<string>",
    "qualifier": "simple",
    "description": "Timezone",
    "namespace": "syminfo"
  },
  {
    "name": "syminfo.currency",
    "type": "simple<string>",
    "qualifier": "simple",
    "description": "Currency",
    "namespace": "syminfo"
  },
  {
    "name": "syminfo.basecurrency",
    "type": "simple<string>",
    "qualifier": "simple",
    "description": "Base currency",
    "namespace": "syminfo"
  },
  {
    "name": "syminfo.description",
    "type": "simple<string>",
    "qualifier": "simple",
    "description": "Symbol description",
    "namespace": "syminfo"
  },
  {
    "name": "syminfo.mintick",
    "type": "simple<float>",
    "qualifier": "simple",
    "description": "Minimum tick size",
    "namespace": "syminfo"
  },
  {
    "name": "syminfo.pointvalue",
    "type": "simple<float>",
    "qualifier": "simple",
    "description": "Point value",
    "namespace": "syminfo"
  },
  {
    "name": "syminfo.country",
    "type": "simple<string>",
    "qualifier": "simple",
    "description": "Country where the symbol is traded",
    "namespace": "syminfo"
  },
  {
    "name": "syminfo.industry",
    "type": "simple<string>",
    "qualifier": "simple",
    "description": "Industry of the symbol",
    "namespace": "syminfo"
  },
  {
    "name": "syminfo.root",
    "type": "simple<string>",
    "qualifier": "simple",
    "description": "Root symbol (for derivatives)",
    "namespace": "syminfo"
  },
  {
    "name": "barstate.isfirst",
    "type": "series<bool>",
    "qualifier": "series",
    "description": "True on first bar",
    "namespace": "barstate"
  },
  {
    "name": "barstate.islast",
    "type": "series<bool>",
    "qualifier": "series",
    "description": "True on last bar",
    "namespace": "barstate"
  },
  {
    "name": "barstate.ishistory",
    "type": "series<bool>",
    "qualifier": "series",
    "description": "True on historical bars",
    "namespace": "barstate"
  },
  {
    "name": "barstate.isrealtime",
    "type": "series<bool>",
    "qualifier": "series",
    "description": "True on realtime bars",
    "namespace": "barstate"
  },
  {
    "name": "barstate.isnew",
    "type": "series<bool>",
    "qualifier": "series",
    "description": "True on new bar",
    "namespace": "barstate"
  },
  {
    "name": "barstate.isconfirmed",
    "type": "series<bool>",
    "qualifier": "series",
    "description": "True when bar is confirmed",
    "namespace": "barstate"
  },
  {
    "name": "barstate.islastconfirmedhistory",
    "type": "series<bool>",
    "qualifier": "series",
    "description": "True on last confirmed historical bar",
    "namespace": "barstate"
  },
  {
    "name": "timeframe.period",
    "type": "simple<string>",
    "qualifier": "simple",
    "description": "Timeframe period string",
    "namespace": "timeframe"
  },
  {
    "name": "timeframe.multiplier",
    "type": "simple<int>",
    "qualifier": "simple",
    "description": "Timeframe multiplier",
    "namespace": "timeframe"
  },
  {
    "name": "timeframe.isseconds",
    "type": "simple<bool>",
    "qualifier": "simple",
    "description": "True if seconds timeframe",
    "namespace": "timeframe"
  },
  {
    "name": "timeframe.isminutes",
    "type": "simple<bool>",
    "qualifier": "simple",
    "description": "True if minutes timeframe",
    "namespace": "timeframe"
  },
  {
    "name": "timeframe.isdaily",
    "type": "simple<bool>",
    "qualifier": "simple",
    "description": "True if daily timeframe",
    "namespace": "timeframe"
  },
  {
    "name": "timeframe.isweekly",
    "type": "simple<bool>",
    "qualifier": "simple",
    "description": "True if weekly timeframe",
    "namespace": "timeframe"
  },
  {
    "name": "timeframe.ismonthly",
    "type": "simple<bool>",
    "qualifier": "simple",
    "description": "True if monthly timeframe",
    "namespace": "timeframe"
  },
  {
    "name": "timeframe.isdwm",
    "type": "simple<bool>",
    "qualifier": "simple",
    "description": "True if daily/weekly/monthly",
    "namespace": "timeframe"
  },
  {
    "name": "timeframe.isintraday",
    "type": "simple<bool>",
    "qualifier": "simple",
    "description": "True if intraday timeframe",
    "namespace": "timeframe"
  },
  {
    "name": "chart.bg_color",
    "type": "color",
    "qualifier": "simple",
    "description": "Chart background color",
    "namespace": "chart"
  },
  {
    "name": "chart.fg_color",
    "type": "color",
    "qualifier": "simple",
    "description": "Chart foreground color",
    "namespace": "chart"
  },
  {
    "name": "chart.is_standard",
    "type": "simple<bool>",
    "qualifier": "simple",
    "description": "True if standard chart",
    "namespace": "chart"
  },
  {
    "name": "chart.is_heikinashi",
    "type": "simple<bool>",
    "qualifier": "simple",
    "description": "True if Heikin Ashi chart",
    "namespace": "chart"
  },
  {
    "name": "chart.is_renko",
    "type": "simple<bool>",
    "qualifier": "simple",
    "description": "True if Renko chart",
    "namespace": "chart"
  },
  {
    "name": "chart.is_kagi",
    "type": "simple<bool>",
    "qualifier": "simple",
    "description": "True if Kagi chart",
    "namespace": "chart"
  },
  {
    "name": "chart.is_linebreak",
    "type": "simple<bool>",
    "qualifier": "simple",
    "description": "True if Line Break chart",
    "namespace": "chart"
  },
  {
    "name": "chart.is_pnf",
    "type": "simple<bool>",
    "qualifier": "simple",
    "description": "True if Point & Figure chart",
    "namespace": "chart"
  },
  {
    "name": "chart.is_range",
    "type": "simple<bool>",
    "qualifier": "simple",
    "description": "True if Range chart",
    "namespace": "chart"
  },
  {
    "name": "chart.left_visible_bar_time",
    "type": "series<int>",
    "qualifier": "series",
    "description": "Time of leftmost visible bar",
    "namespace": "chart"
  },
  {
    "name": "chart.right_visible_bar_time",
    "type": "series<int>",
    "qualifier": "series",
    "description": "Time of rightmost visible bar",
    "namespace": "chart"
  },
  {
    "name": "session.ismarket",
    "type": "series<bool>",
    "qualifier": "series",
    "description": "True during market session",
    "namespace": "session"
  },
  {
    "name": "session.ispremarket",
    "type": "series<bool>",
    "qualifier": "series",
    "description": "True during pre-market",
    "namespace": "session"
  },
  {
    "name": "session.ispostmarket",
    "type": "series<bool>",
    "qualifier": "series",
    "description": "True during post-market",
    "namespace": "session"
  },
  {
    "name": "strategy.position_size",
    "type": "series<float>",
    "qualifier": "series",
    "description": "Current position size",
    "namespace": "strategy"
  },
  {
    "name": "strategy.position_avg_price",
    "type": "series<float>",
    "qualifier": "series",
    "description": "Average position price",
    "namespace": "strategy"
  },
  {
    "name": "strategy.equity",
    "type": "series<float>",
    "qualifier": "series",
    "description": "Current equity",
    "namespace": "strategy"
  },
  {
    "name": "strategy.openprofit",
    "type": "series<float>",
    "qualifier": "series",
    "description": "Open profit",
    "namespace": "strategy"
  },
  {
    "name": "strategy.netprofit",
    "type": "series<float>",
    "qualifier": "series",
    "description": "Net profit",
    "namespace": "strategy"
  },
  {
    "name": "strategy.grossprofit",
    "type": "series<float>",
    "qualifier": "series",
    "description": "Gross profit",
    "namespace": "strategy"
  },
  {
    "name": "strategy.grossloss",
    "type": "series<float>",
    "qualifier": "series",
    "description": "Gross loss",
    "namespace": "strategy"
  },
  {
    "name": "strategy.closedtrades",
    "type": "series<int>",
    "qualifier": "series",
    "description": "Number of closed trades",
    "namespace": "strategy"
  },
  {
    "name": "strategy.opentrades",
    "type": "series<int>",
    "qualifier": "series",
    "description": "Number of open trades",
    "namespace": "strategy"
  },
  {
    "name": "strategy.wintrades",
    "type": "series<int>",
    "qualifier": "series",
    "description": "Number of winning trades",
    "namespace": "strategy"
  },
  {
    "name": "strategy.losstrades",
    "type": "series<int>",
    "qualifier": "series",
    "description": "Number of losing trades",
    "namespace": "strategy"
  },
  {
    "name": "strategy.initial_capital",
    "type": "simple<float>",
    "qualifier": "simple",
    "description": "Initial capital",
    "namespace": "strategy"
  },
  {
    "name": "strategy.openprofit_percent",
    "type": "series<float>",
    "qualifier": "series",
    "description": "Open profit as a percentage of initial capital",
    "namespace": "strategy"
  },
  {
    "name": "strategy.netprofit_percent",
    "type": "series<float>",
    "qualifier": "series",
    "description": "Net profit as a percentage of initial capital",
    "namespace": "strategy"
  },
  {
    "name": "strategy.max_drawdown_percent",
    "type": "series<float>",
    "qualifier": "series",
    "description": "Maximum drawdown as a percentage",
    "namespace": "strategy"
  }
];

/**
 * Variables indexed by name for O(1) lookup
 */
export const VARIABLES_BY_NAME: Map<string, PineVariable> = new Map(
	VARIABLES.map(v => [v.name, v])
);

/**
 * Variables grouped by namespace
 */
export const VARIABLES_BY_NAMESPACE: Map<string, PineVariable[]> = (() => {
	const map = new Map<string, PineVariable[]>();
	for (const v of VARIABLES) {
		const ns = v.namespace || "_standalone";
		if (!map.has(ns)) map.set(ns, []);
		map.get(ns)!.push(v);
	}
	return map;
})();

/**
 * All variable names as a Set for fast membership check
 */
export const VARIABLE_NAMES: Set<string> = new Set(VARIABLES.map(v => v.name));

/**
 * Standalone variables (no namespace)
 */
export const STANDALONE_VARIABLES: Set<string> = new Set(
	VARIABLES.filter(v => !v.namespace).map(v => v.name)
);

/**
 * All namespace names that have variables
 */
export const VARIABLE_NAMESPACES: Set<string> = new Set(
	VARIABLES.filter(v => v.namespace).map(v => v.namespace!)
);
