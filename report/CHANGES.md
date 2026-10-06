# Changes to the mid-semester report (QCNN_Mid_1_1.docx -> QCNN_Mid_updated.docx)

**Removed**
- Table 5 / old Fig. 7 (the only original graph dropped: accuracy comparison with the reference paper) and the "Comparison with the reference paper" text.
- Paper-vs-ours accuracy statements in the abstract, introduction, objectives, limitations and expected outcomes.
- Table 1 (paper's circuit characteristics, now one sentence) (the old per-seed min–max vs Gaussian chart is kept as Fig. 6), Table 3 (epoch table, now in text), the Max row of the seed table.

**Added**
- Closed-form filter output f_k = s_0...s_k, verified against the circuit (error 6.7e-16); native Word equations (1)-(11): scaling, encoding, circuit, measurement, loss, chain rule, parameter shift, circuit-run count, shot noise.
- New figures: filter response (Fig. 3), hardware cost and shot noise (Fig. 4), per-seed distribution (Fig. 6), Yale tuning and augmentation study (Fig. 7).
- Yale augmentation result (no augmentation best; gap grows 22 -> 29 points) and 5th column (selected Yale setup) in the per-seed table.
- Future scope: feature-extraction stage to reduce circuit count; note that most trainable parameters are in the classical head; two parameter-shift references [22, 23].

**Updated**
- Abstract, limitations, work plan (no classical baseline), expected outcomes (paper ablation numbers kept as verification targets only).
- Report compressed from 22 pages to a separate cover page (original layout) plus 8 pages of content (9 pages in total).

Not included: final augmented 10-seed Yale run (notebook output was truncated at seed 5).
