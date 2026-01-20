/**
 * Trade Calculation Utilities for UrbanExchange
 * All calculations derived from simulated trade data
 */

/**
 * Calculate PnL for a single trade
 * @param {Object} trade - Trade object with entryPrice, exitPrice, quantity, side
 * @returns {number} - Profit/loss amount
 */
export function calculatePnL(trade) {
    if (!trade.exitPrice || !trade.entryPrice || !trade.quantity) return 0;

    const multiplier = trade.side === 'BUY' || trade.originalArray === 'buyOrders' ? 1 : -1;
    const pnl = (trade.exitPrice - trade.entryPrice) * trade.quantity * multiplier;
    return pnl;
}

/**
 * Calculate Net PnL (total PnL minus all charges)
 * @param {Array} trades - Array of trade objects
 * @returns {number} - Net profit/loss after charges
 */
export function calculateNetPnL(trades) {
    if (!trades || trades.length === 0) return 0;

    const grossPnL = trades.reduce((sum, trade) => sum + calculatePnL(trade), 0);
    const totalCharges = trades.reduce((sum, trade) => {
        const brokerage = trade.brokerage || 0;
        const charges = trade.charges || 0;
        return sum + brokerage + charges;
    }, 0);

    return grossPnL - totalCharges;
}

/**
 * Calculate win rate percentage
 * @param {Array} trades - Array of completed trades
 * @returns {number} - Win rate as percentage (0-100)
 */
export function calculateWinRate(trades) {
    if (!trades || trades.length === 0) return 0;

    const completedTrades = trades.filter(t =>
        t.tradeStatus === 'COMPLETED' ||
        t.tradeStatus === 'TARGET_HIT' ||
        t.tradeStatus === 'SL_HIT' ||
        t.status === 'completed'
    );

    if (completedTrades.length === 0) return 0;

    const winningTrades = completedTrades.filter(t => calculatePnL(t) > 0);
    return (winningTrades.length / completedTrades.length) * 100;
}

/**
 * Calculate maximum drawdown (peak-to-trough decline)
 * @param {Array} trades - Array of trades sorted by timestamp
 * @returns {number} - Maximum drawdown as absolute value
 */
export function calculateMaxDrawdown(trades) {
    if (!trades || trades.length === 0) return 0;

    const sortedTrades = [...trades].sort((a, b) =>
        new Date(a.timestamp) - new Date(b.timestamp)
    );

    let peak = 0;
    let maxDrawdown = 0;
    let runningPnL = 0;

    for (const trade of sortedTrades) {
        runningPnL += calculatePnL(trade);
        if (runningPnL > peak) {
            peak = runningPnL;
        }
        const drawdown = peak - runningPnL;
        if (drawdown > maxDrawdown) {
            maxDrawdown = drawdown;
        }
    }

    return maxDrawdown;
}

/**
 * Calculate equity curve (cumulative PnL over time)
 * @param {Array} trades - Array of trades
 * @returns {Array} - Array of {date, equity} objects
 */
export function calculateEquityCurve(trades) {
    if (!trades || trades.length === 0) return [];

    const sortedTrades = [...trades].sort((a, b) =>
        new Date(a.timestamp) - new Date(b.timestamp)
    );

    let runningPnL = 0;
    const curve = [];

    for (const trade of sortedTrades) {
        runningPnL += calculatePnL(trade);
        const brokerage = trade.brokerage || 0;
        const charges = trade.charges || 0;
        runningPnL -= (brokerage + charges);

        curve.push({
            date: new Date(trade.timestamp).toLocaleDateString(),
            timestamp: trade.timestamp,
            equity: runningPnL,
            tradeId: trade.tradeId || trade._id
        });
    }

    return curve;
}

/**
 * Group PnL by weekday
 * @param {Array} trades - Array of trades
 * @returns {Object} - PnL grouped by weekday name
 */
export function groupPnLByWeekday(trades) {
    if (!trades || trades.length === 0) return {};

    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const grouped = {};

    weekdays.forEach(day => {
        grouped[day] = { pnl: 0, trades: 0 };
    });

    for (const trade of trades) {
        const date = new Date(trade.timestamp);
        const dayName = weekdays[date.getDay()];
        grouped[dayName].pnl += calculatePnL(trade);
        grouped[dayName].trades += 1;
    }

    return grouped;
}

/**
 * Group PnL by time windows
 * @param {Array} trades - Array of trades
 * @returns {Object} - PnL grouped by time windows
 */
export function groupPnLByTimeWindow(trades) {
    if (!trades || trades.length === 0) return {};

    const windows = {
        '9AM-11AM': { pnl: 0, trades: 0 },
        '11AM-1PM': { pnl: 0, trades: 0 },
        '1PM-3PM': { pnl: 0, trades: 0 },
        '3PM-5PM': { pnl: 0, trades: 0 }
    };

    for (const trade of trades) {
        const date = new Date(trade.timestamp);
        const hour = date.getHours();

        let windowKey;
        if (hour >= 9 && hour < 11) {
            windowKey = '9AM-11AM';
        } else if (hour >= 11 && hour < 13) {
            windowKey = '11AM-1PM';
        } else if (hour >= 13 && hour < 15) {
            windowKey = '1PM-3PM';
        } else if (hour >= 15 && hour < 17) {
            windowKey = '3PM-5PM';
        }

        if (windowKey) {
            windows[windowKey].pnl += calculatePnL(trade);
            windows[windowKey].trades += 1;
        }
    }

    return windows;
}

/**
 * Calculate Risk-Reward ratio
 * @param {Object} trade - Trade with stopLoss, target, entryPrice
 * @returns {number|null} - R:R ratio or null if not calculable
 */
export function calculateRiskRewardRatio(trade) {
    if (!trade.stopLoss || !trade.target || !trade.entryPrice) return null;

    const isBuy = trade.side === 'BUY' || trade.originalArray === 'buyOrders';

    let risk, reward;
    if (isBuy) {
        risk = trade.entryPrice - trade.stopLoss;
        reward = trade.target - trade.entryPrice;
    } else {
        risk = trade.stopLoss - trade.entryPrice;
        reward = trade.entryPrice - trade.target;
    }

    if (risk <= 0) return null;
    return reward / risk;
}

/**
 * Detect common trading mistakes
 * @param {Array} trades - Array of trades
 * @returns {Object} - Categorized mistakes
 */
export function detectMistakes(trades) {
    if (!trades || trades.length === 0) {
        return { noStopLoss: [], poorRR: [], rapidReentry: [], total: 0 };
    }

    const mistakes = {
        noStopLoss: [],
        poorRR: [],
        rapidReentry: [],
        total: 0
    };

    const sortedTrades = [...trades].sort((a, b) =>
        new Date(a.timestamp) - new Date(b.timestamp)
    );

    for (let i = 0; i < sortedTrades.length; i++) {
        const trade = sortedTrades[i];

        // Check for no stop loss
        if (!trade.stopLoss) {
            mistakes.noStopLoss.push({
                ...trade,
                mistakeType: 'NO_STOP_LOSS',
                severity: 'HIGH',
                impact: Math.abs(calculatePnL(trade))
            });
            mistakes.total++;
        }

        // Check for poor R:R ratio
        const rr = calculateRiskRewardRatio(trade);
        if (rr !== null && rr < 1) {
            mistakes.poorRR.push({
                ...trade,
                mistakeType: 'POOR_RR_RATIO',
                severity: 'MEDIUM',
                rrRatio: rr,
                impact: Math.abs(calculatePnL(trade))
            });
            mistakes.total++;
        }

        // Check for rapid re-entry after loss
        if (i > 0) {
            const prevTrade = sortedTrades[i - 1];
            const prevPnL = calculatePnL(prevTrade);
            const timeDiff = new Date(trade.timestamp) - new Date(prevTrade.timestamp);
            const fiveMinutes = 5 * 60 * 1000;

            if (prevPnL < 0 && timeDiff < fiveMinutes) {
                mistakes.rapidReentry.push({
                    ...trade,
                    mistakeType: 'RAPID_REENTRY',
                    severity: 'MEDIUM',
                    prevLoss: prevPnL,
                    timeSinceLoss: Math.round(timeDiff / 1000 / 60),
                    impact: Math.abs(calculatePnL(trade))
                });
                mistakes.total++;
            }
        }
    }

    return mistakes;
}

/**
 * Generate ledger entries from trades
 * @param {Array} trades - Array of trades
 * @returns {Array} - Ledger entries with debit, credit, balance
 */
export function generateLedgerEntries(trades) {
    if (!trades || trades.length === 0) return [];

    const sortedTrades = [...trades].sort((a, b) =>
        new Date(a.timestamp) - new Date(b.timestamp)
    );

    let runningBalance = 0;
    const entries = [];

    for (const trade of sortedTrades) {
        const pnl = calculatePnL(trade);
        const brokerage = trade.brokerage || 0;
        const charges = trade.charges || 0;

        // PnL entry
        if (pnl >= 0) {
            runningBalance += pnl;
            entries.push({
                date: new Date(trade.timestamp).toLocaleDateString(),
                timestamp: trade.timestamp,
                description: `Profit: ${trade.symbol || trade.instrument || 'Trade'}`,
                debit: 0,
                credit: pnl,
                balance: runningBalance,
                type: 'PROFIT',
                tradeId: trade.tradeId || trade._id
            });
        } else {
            runningBalance += pnl;
            entries.push({
                date: new Date(trade.timestamp).toLocaleDateString(),
                timestamp: trade.timestamp,
                description: `Loss: ${trade.symbol || trade.instrument || 'Trade'}`,
                debit: Math.abs(pnl),
                credit: 0,
                balance: runningBalance,
                type: 'LOSS',
                tradeId: trade.tradeId || trade._id
            });
        }

        // Brokerage entry
        if (brokerage > 0) {
            runningBalance -= brokerage;
            entries.push({
                date: new Date(trade.timestamp).toLocaleDateString(),
                timestamp: trade.timestamp,
                description: 'Brokerage',
                debit: brokerage,
                credit: 0,
                balance: runningBalance,
                type: 'BROKERAGE',
                tradeId: trade.tradeId || trade._id
            });
        }

        // Other charges entry
        if (charges > 0) {
            runningBalance -= charges;
            entries.push({
                date: new Date(trade.timestamp).toLocaleDateString(),
                timestamp: trade.timestamp,
                description: 'Charges (STT, Exchange, GST)',
                debit: charges,
                credit: 0,
                balance: runningBalance,
                type: 'CHARGES',
                tradeId: trade.tradeId || trade._id
            });
        }
    }

    return entries;
}

/**
 * Get daily summary from ledger entries
 * @param {Array} entries - Ledger entries
 * @returns {Array} - Daily summaries
 */
export function getDailySummary(entries) {
    if (!entries || entries.length === 0) return [];

    const dailyMap = {};

    for (const entry of entries) {
        const date = entry.date;
        if (!dailyMap[date]) {
            dailyMap[date] = {
                date,
                totalDebit: 0,
                totalCredit: 0,
                netPnL: 0,
                trades: 0
            };
        }

        dailyMap[date].totalDebit += entry.debit;
        dailyMap[date].totalCredit += entry.credit;

        if (entry.type === 'PROFIT' || entry.type === 'LOSS') {
            dailyMap[date].trades++;
        }
    }

    return Object.values(dailyMap).map(day => ({
        ...day,
        netPnL: day.totalCredit - day.totalDebit
    }));
}

/**
 * Get monthly summary from ledger entries
 * @param {Array} entries - Ledger entries
 * @returns {Array} - Monthly summaries
 */
export function getMonthlySummary(entries) {
    if (!entries || entries.length === 0) return [];

    const monthlyMap = {};

    for (const entry of entries) {
        const date = new Date(entry.timestamp);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        if (!monthlyMap[monthKey]) {
            monthlyMap[monthKey] = {
                month: monthName,
                monthKey,
                totalDebit: 0,
                totalCredit: 0,
                netPnL: 0,
                trades: 0
            };
        }

        monthlyMap[monthKey].totalDebit += entry.debit;
        monthlyMap[monthKey].totalCredit += entry.credit;

        if (entry.type === 'PROFIT' || entry.type === 'LOSS') {
            monthlyMap[monthKey].trades++;
        }
    }

    return Object.values(monthlyMap).map(month => ({
        ...month,
        netPnL: month.totalCredit - month.totalDebit
    }));
}

/**
 * Calculate consecutive losses
 * @param {Array} trades - Array of trades sorted by timestamp
 * @returns {Object} - Streak info
 */
export function calculateConsecutiveLosses(trades) {
    if (!trades || trades.length === 0) {
        return { current: 0, max: 0 };
    }

    const sortedTrades = [...trades].sort((a, b) =>
        new Date(a.timestamp) - new Date(b.timestamp)
    );

    let currentStreak = 0;
    let maxStreak = 0;

    for (const trade of sortedTrades) {
        const pnl = calculatePnL(trade);
        if (pnl < 0) {
            currentStreak++;
            maxStreak = Math.max(maxStreak, currentStreak);
        } else {
            currentStreak = 0;
        }
    }

    return { current: currentStreak, max: maxStreak };
}

/**
 * Get trades for a specific date
 * @param {Array} trades - Array of trades
 * @param {Date} date - Target date
 * @returns {Array} - Trades for that day
 */
export function getTradesForDate(trades, date) {
    if (!trades || trades.length === 0) return [];

    const targetDate = new Date(date).toDateString();

    return trades.filter(trade => {
        const tradeDate = new Date(trade.timestamp).toDateString();
        return tradeDate === targetDate;
    }).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

/**
 * Generate insights from trade data
 * @param {Array} trades - Array of trades
 * @returns {Array} - Insight messages
 */
export function generateInsights(trades) {
    if (!trades || trades.length === 0) return [];

    const insights = [];

    // Best day analysis
    const weekdayPnL = groupPnLByWeekday(trades);
    const bestDay = Object.entries(weekdayPnL)
        .filter(([_, data]) => data.trades > 0)
        .sort((a, b) => b[1].pnl - a[1].pnl)[0];

    if (bestDay && bestDay[1].pnl > 0) {
        insights.push({
            type: 'success',
            icon: '📈',
            message: `You perform best on ${bestDay[0]}s with ₹${bestDay[1].pnl.toFixed(2)} total profit`
        });
    }

    // Worst time window
    const timeWindowPnL = groupPnLByTimeWindow(trades);
    const worstWindow = Object.entries(timeWindowPnL)
        .filter(([_, data]) => data.trades > 0)
        .sort((a, b) => a[1].pnl - b[1].pnl)[0];

    if (worstWindow && worstWindow[1].pnl < 0) {
        insights.push({
            type: 'warning',
            icon: '⚠️',
            message: `Most losses happen in ${worstWindow[0]} sessions. Consider avoiding this time.`
        });
    }

    // Win rate insight
    const winRate = calculateWinRate(trades);
    if (winRate >= 50) {
        insights.push({
            type: 'success',
            icon: '🎯',
            message: `Your win rate of ${winRate.toFixed(1)}% shows good trade selection!`
        });
    } else if (winRate < 50 && winRate > 0) {
        insights.push({
            type: 'info',
            icon: '💡',
            message: `Your win rate is ${winRate.toFixed(1)}%. Focus on trade setups to improve.`
        });
    }

    // Best instrument
    const instrumentPnL = {};
    for (const trade of trades) {
        const symbol = trade.symbol || trade.instrument || 'Unknown';
        if (!instrumentPnL[symbol]) {
            instrumentPnL[symbol] = 0;
        }
        instrumentPnL[symbol] += calculatePnL(trade);
    }

    const bestInstrument = Object.entries(instrumentPnL)
        .sort((a, b) => b[1] - a[1])[0];

    if (bestInstrument && bestInstrument[1] > 0) {
        insights.push({
            type: 'success',
            icon: '⭐',
            message: `${bestInstrument[0]} suits your trading style with ₹${bestInstrument[1].toFixed(2)} profit`
        });
    }

    // Consistency check
    const consecutiveLosses = calculateConsecutiveLosses(trades);
    if (consecutiveLosses.max >= 3) {
        insights.push({
            type: 'warning',
            icon: '🛑',
            message: `You had ${consecutiveLosses.max} consecutive losses. Consider taking breaks after 2 losses.`
        });
    }

    return insights;
}
