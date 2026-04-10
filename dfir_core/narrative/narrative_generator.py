# 2:22 DFIR Framework — Narrative Generator
# Generates forensic investigation narratives using LLM or deterministic templates
# The deterministic mode ensures reproducibility when LLM is unavailable

import time
from collections import Counter

from narrative_llm.openai_client import OpenAILLMClient
from narrative.batching import chunk_artifacts, build_batch_prompt
from narrative.narrative_templates import SYNTHESIS_TEMPLATE, DETERMINISTIC_NARRATIVE_TEMPLATE
from narrative.narrative_config import RATE_LIMIT_DELAY


class NarrativeGenerator:
    def __init__(self):
        self.llm_client = OpenAILLMClient()

    def GenerateBatched(self, triaged: list[dict], batch_size: int = 25) -> list[str]:
        """Generate narrative summaries in batches via LLM."""
        batches = list(chunk_artifacts(triaged, batch_size))
        narratives = []

        for idx, batch in enumerate(batches, start=1):
            prompt = build_batch_prompt(batch, idx, len(batches))
            result = self.llm_client.generate(prompt)
            narratives.append(result)
            if idx < len(batches):
                time.sleep(RATE_LIMIT_DELAY)

        return narratives

    def Synthesize(self, batch_narratives: list[str]) -> str:
        """Synthesize batch narratives into a cohesive summary via LLM."""
        combined = "\n\n---\n\n".join(batch_narratives)
        prompt = SYNTHESIS_TEMPLATE.format(combined=combined)
        return self.llm_client.generate(prompt)

    def GenerateDeterministic(
        self,
        triaged: list[dict],
        intel: dict,
    ) -> str:
        """
        Generate a fully deterministic narrative without LLM.
        Ensures reproducibility and works offline.
        """
        total = len(triaged)
        severity = intel.get("overall_severity", "UNKNOWN")
        max_score = intel.get("max_triage_score", 0)
        fingerprint = intel.get("behavioral_fingerprint", {})

        # Active channels
        active = intel.get("active_channels", [])
        active_str = ", ".join(active) if active else "None identified"

        # Technique count
        tech_count = intel.get("mitre_technique_count", 0)

        # Kill chain coverage
        kc_coverage = intel.get("kill_chain_coverage", 0)

        # Artifact distribution
        type_dist = fingerprint.get("artifact_type_distribution", {})
        dist_lines = []
        for atype, count in sorted(type_dist.items(), key=lambda x: -x[1]):
            pct = (count / max(total, 1)) * 100
            dist_lines.append(f"  - {atype}: {count} artifacts ({pct:.1f}%)")
        artifact_distribution = "\n".join(dist_lines) if dist_lines else "  No artifact type data available."

        # Temporal analysis
        timeline = intel.get("timeline", {})
        if timeline:
            temporal_analysis = (
                f"The investigation spans from {timeline.get('earliest_event', 'N/A')} "
                f"to {timeline.get('latest_event', 'N/A')} "
                f"({timeline.get('span_hours', 'N/A')} hours). "
                f"Peak activity was observed at hour {fingerprint.get('peak_activity_hour', 'N/A')} "
                f"on {fingerprint.get('peak_activity_day', 'N/A')}."
            )
        else:
            temporal_analysis = "Temporal data insufficient for timeline analysis."

        # Channel analysis
        channels = intel.get("attack_channels", {})
        channel_evidence = intel.get("channel_evidence", {})
        channel_lines = []
        for ch, is_active in channels.items():
            if is_active:
                evidence = channel_evidence.get(ch, [])
                ev_str = ", ".join(evidence[:5]) if evidence else "pattern match"
                channel_lines.append(f"  - {ch.replace('_', ' ').title()}: Active (evidence: {ev_str})")
        channel_analysis = "\n".join(channel_lines) if channel_lines else "  No attack channels identified."

        # IoC summary
        top_ips = intel.get("top_source_ips", [])
        ioc_lines = []
        for ip_info in top_ips[:10]:
            attacks = ", ".join(ip_info.get("attack_types", [])) or "general"
            ioc_lines.append(
                f"  - IP {ip_info['ip']}: {ip_info['event_count']} events ({attacks})"
            )
        ioc_summary = "\n".join(ioc_lines) if ioc_lines else "  No significant IoCs extracted."

        # Conclusion detail
        if severity in ("CRITICAL", "HIGH"):
            conclusion_detail = (
                "The evidence indicates significant malicious activity targeting "
                "county government information systems. Immediate incident response "
                "actions are recommended, including network containment, credential "
                "rotation, and comprehensive system audit."
            )
        elif severity == "MEDIUM":
            conclusion_detail = (
                "The evidence suggests suspicious activity that warrants further "
                "investigation. Recommended actions include enhanced monitoring, "
                "log review expansion, and security posture assessment."
            )
        else:
            conclusion_detail = (
                "The observed activity is within expected operational parameters "
                "with minor anomalies. Continued monitoring is recommended."
            )

        return DETERMINISTIC_NARRATIVE_TEMPLATE.format(
            total_artifacts=total,
            severity=severity,
            max_score=f"{max_score:.4f}",
            active_channels=active_str,
            technique_count=tech_count,
            kill_chain_coverage=kc_coverage,
            artifact_distribution=artifact_distribution,
            temporal_analysis=temporal_analysis,
            channel_analysis=channel_analysis,
            ioc_summary=ioc_summary,
            velocity=fingerprint.get("attack_velocity", "N/A"),
            time_pattern=fingerprint.get("time_pattern", "N/A"),
            tooling=fingerprint.get("tooling_consistency", "N/A"),
            automation=fingerprint.get("automation_likelihood", "N/A"),
            conclusion_detail=conclusion_detail,
        )
