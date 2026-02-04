// ============================================
// EXPENSE SERVICE
// Data access functions that can be swapped to Supabase
// ============================================

import type { Expense, ExpenseSummary, MemberBalance } from '@shared/domain';
import { getExpensesByTrip, computeExpenseSummary, mockExpenses } from '../mocks';

/**
 * Get all expenses for a trip
 */
export async function getTripExpenses(tripId: string): Promise<Expense[]> {
  // TODO: Replace with Supabase query
  return getExpensesByTrip(tripId).map(exp => ({
    ...exp,
    date: new Date(exp.date),
    createdAt: new Date(exp.createdAt),
  }));
}

/**
 * Get expense summary with balances
 */
export async function getTripExpenseSummary(tripId: string): Promise<ExpenseSummary> {
  // TODO: Replace with Supabase aggregation
  return computeExpenseSummary(tripId);
}

/**
 * Get a single expense
 */
export async function getExpense(expenseId: string): Promise<Expense | null> {
  // TODO: Replace with Supabase query
  const expense = mockExpenses.find(e => e.id === expenseId);
  if (!expense) return null;
  
  return {
    ...expense,
    date: new Date(expense.date),
    createdAt: new Date(expense.createdAt),
  };
}

/**
 * Get expenses for a specific member
 */
export async function getMemberExpenses(
  tripId: string, 
  memberId: string
): Promise<Expense[]> {
  const expenses = await getTripExpenses(tripId);
  
  return expenses.filter(exp => 
    exp.paidBy === memberId || 
    (exp.splitAmong && exp.splitAmong.includes(memberId))
  );
}

/**
 * Get member balance (what they've paid vs what they owe)
 */
export async function getMemberBalance(
  tripId: string, 
  memberId: string
): Promise<MemberBalance | null> {
  const summary = await getTripExpenseSummary(tripId);
  return summary.memberBalances.find(b => b.memberId === memberId) || null;
}

/**
 * Create a new expense
 */
export async function createExpense(
  expense: Omit<Expense, 'id' | 'createdAt'>
): Promise<Expense> {
  // TODO: Replace with Supabase insert
  const newExpense: Expense = {
    ...expense,
    id: `exp-${Date.now()}`,
    createdAt: new Date(),
  };
  
  return newExpense;
}

/**
 * Update an expense
 */
export async function updateExpense(
  expenseId: string,
  updates: Partial<Expense>
): Promise<Expense | null> {
  // TODO: Replace with Supabase update
  const expense = await getExpense(expenseId);
  if (!expense) return null;
  
  return { ...expense, ...updates };
}

/**
 * Mark expense as settled
 */
export async function settleExpense(expenseId: string): Promise<Expense | null> {
  return updateExpense(expenseId, { settled: true });
}

/**
 * Delete an expense
 */
export async function deleteExpense(expenseId: string): Promise<boolean> {
  // TODO: Replace with Supabase delete
  const expense = await getExpense(expenseId);
  return expense !== null;
}

/**
 * Get unsettled expenses
 */
export async function getUnsettledExpenses(tripId: string): Promise<Expense[]> {
  const expenses = await getTripExpenses(tripId);
  return expenses.filter(exp => !exp.settled);
}

/**
 * Get expenses by category
 */
export async function getExpensesByCategory(
  tripId: string,
  category: Expense['category']
): Promise<Expense[]> {
  const expenses = await getTripExpenses(tripId);
  return expenses.filter(exp => exp.category === category);
}
