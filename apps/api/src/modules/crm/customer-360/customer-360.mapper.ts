import type {
  Customer,
  CustomerFile,
  CustomerLifetimeValue,
  CustomerNote,
  CustomerRiskScore,
  CustomerScore,
  CustomerTimelineEvent,
} from '@prisma/client';
import { mapCustomerSummary } from '../customers/customers.mapper';

function decimalToNumber(value: { toString(): string }): number {
  return Number(value.toString());
}

export function mapTimelineEvent(event: CustomerTimelineEvent) {
  return {
    id: event.id,
    eventType: event.eventType,
    title: event.title,
    summary: event.summary,
    occurredAt: event.occurredAt.toISOString(),
    createdAt: event.createdAt.toISOString(),
  };
}

export function mapCustomerScore(score: CustomerScore) {
  return {
    id: score.id,
    metricCode: score.metricCode,
    scoreValue: decimalToNumber(score.scoreValue),
    recordedAt: score.recordedAt.toISOString(),
  };
}

export function mapCustomerRiskScore(risk: CustomerRiskScore) {
  return {
    id: risk.id,
    riskLevel: risk.riskLevel,
    riskScore: decimalToNumber(risk.riskScore),
    assessedAt: risk.assessedAt.toISOString(),
  };
}

export function mapCustomerLifetimeValue(ltv: CustomerLifetimeValue) {
  return {
    id: ltv.id,
    currency: ltv.currency,
    ltvValue: decimalToNumber(ltv.ltvValue),
    calculatedAt: ltv.calculatedAt.toISOString(),
  };
}

export function mapNote(note: CustomerNote) {
  return {
    id: note.id,
    title: note.title,
    body: note.body,
    createdAt: note.createdAt.toISOString(),
  };
}

export function mapFile(file: CustomerFile) {
  return {
    id: file.id,
    fileName: file.fileName,
    mimeType: file.mimeType,
    byteSize: file.byteSize === null ? null : Number(file.byteSize),
    createdAt: file.createdAt.toISOString(),
  };
}

export function pickLatestScoresByMetric(scores: CustomerScore[]): CustomerScore[] {
  const latestByMetric = new Map<string, CustomerScore>();

  for (const score of scores) {
    const existing = latestByMetric.get(score.metricCode);
    if (!existing || score.recordedAt > existing.recordedAt) {
      latestByMetric.set(score.metricCode, score);
    }
  }

  return [...latestByMetric.values()].sort((a, b) =>
    a.metricCode.localeCompare(b.metricCode),
  );
}

export function mapCustomer360View(input: {
  customer: Customer;
  scores: CustomerScore[];
  riskScores: CustomerRiskScore[];
  lifetimeValues: CustomerLifetimeValue[];
  notes: CustomerNote[];
  files: CustomerFile[];
  timelinePreview: CustomerTimelineEvent[];
}) {
  const latestRisk = input.riskScores.sort(
    (a, b) => b.assessedAt.getTime() - a.assessedAt.getTime(),
  )[0];
  const latestLtv = input.lifetimeValues.sort(
    (a, b) => b.calculatedAt.getTime() - a.calculatedAt.getTime(),
  )[0];

  return {
    ...mapCustomerSummary(input.customer),
    scores: pickLatestScoresByMetric(input.scores).map(mapCustomerScore),
    riskScore: latestRisk ? mapCustomerRiskScore(latestRisk) : null,
    lifetimeValue: latestLtv ? mapCustomerLifetimeValue(latestLtv) : null,
    notes: input.notes.map(mapNote),
    files: input.files.map(mapFile),
    timelinePreview: input.timelinePreview.map(mapTimelineEvent),
  };
}
