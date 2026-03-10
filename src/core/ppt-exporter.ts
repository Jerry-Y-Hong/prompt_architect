import pptxgen from "pptxgenjs";

/**
 * Helper to add a cinematic title slide
 */
const addTitleSlide = (pres: any, mainTitle: string, bullets: string[], bgColor: string, goldColor: string, textColor: string, subTextColor: string, backgroundImagePath?: string) => {
    const slide = pres.addSlide();
    slide.background = { color: bgColor };

    if (backgroundImagePath) {
        slide.addImage({
            path: backgroundImagePath,
            x: 0, y: 0, w: '100%', h: '100%',
        });
    }

    // Semi-transparent overlay to ensure text stands out
    slide.addShape(pres.ShapeType.rect, {
        x: 0, y: 0, w: '100%', h: '100%',
        fill: { color: "0F172A", transparency: 40 } // slate-950 with transparency
    });

    slide.addShape(pres.ShapeType.rect, {
        x: 0, y: '50%', w: '100%', h: '50%',
        fill: { color: "0F172A", transparency: 20 }
    });

    // Content container near the bottom
    slide.addShape(pres.ShapeType.line, {
        x: 0.8, y: 2.0, w: 1.5, h: 0,
        line: { color: "3B82F6", width: 4 } // Blue-500 line
    });

    slide.addText(mainTitle, {
        x: 0.8, y: 2.3, w: 8.5, h: 1.2,
        align: "left", fontSize: 44, bold: true, color: "FFFFFF",
        fontFace: "Pretendard, Malgun Gothic, Arial",
        fit: "shrink", wrap: true
    });

    if (bullets && bullets.length > 0) {
        slide.addText(bullets.join('\n'), {
            x: 0.8, y: 5.0, w: 8.5, h: 1.5,
            fontSize: 20, color: "CBD5E1", // slate-300
            valign: "top", fontFace: "Pretendard, Malgun Gothic, Arial",
            lineSpacing: 32,
            fit: "shrink", wrap: true
        });
    }
};

/**
 * Helper to add a content slide with dynamic layout (Side Image vs Centered)
 */
const addContentSlide = (pres: any, slideTitle: string, bullets: string[], bgColor: string, goldColor: string, accentColor: string, textColor: string, backgroundImagePath?: string, slideIndex?: number) => {
    const slide = pres.addSlide();
    slide.background = { color: "0F172A" }; // slate-900

    if (backgroundImagePath) {
        // --- 50/50 SIDE IMAGE LAYOUT ---
        slide.addImage({
            path: backgroundImagePath,
            x: '55%', y: 0, w: '45%', h: '100%',
            sizing: { type: "cover" }
        });

        // Gradient divider/scrim
        slide.addShape(pres.ShapeType.rect, {
            x: '50%', y: 0, w: '10%', h: '100%',
            fill: { color: "0F172A", transparency: 30 }
        });

        // Slide Number Marker (Header Style)
        if (slideIndex) {
            slide.addText(`SLIDE ${slideIndex}`, {
                x: 0.5, y: 0.2, w: 2.0, h: 0.3,
                fontSize: 9, color: "06B6D4", // cyan-500
                bold: true, letterSpacing: 3, fontFace: "Arial Black"
            });
            slide.addShape(pres.ShapeType.line, {
                x: 0.5, y: 0.45, w: 0.8, h: 0,
                line: { color: "06B6D4", width: 1, transparency: 70 }
            });
        }

        // Title
        slide.addText(slideTitle, {
            x: 0.5, y: 0.4, w: 4.8, h: 1.0,
            fontSize: 32, bold: true, color: "FFFFFF",
            fontFace: "Pretendard, Malgun Gothic, Arial",
            fit: "shrink", wrap: true
        });

        slide.addShape(pres.ShapeType.line, {
            x: 0.5, y: 1.4, w: 1.0, h: 0,
            line: { color: "06B6D4", width: 2 } // cyan-500
        });

        // Bullets
        slide.addText(bullets.join('\n\n'), {
            x: 0.5, y: 1.6, w: 4.8, h: 3.8,
            fontSize: 18, color: "CBD5E1", // slate-300
            valign: "top", fontFace: "Pretendard, Malgun Gothic, Arial",
            lineSpacing: 30, bullet: { type: "bullet", indent: 20 },
            fit: "shrink", wrap: true
        });

    } else {
        // --- CENTERED TYPOGRAPHY LAYOUT ---
        // Slide Number Marker (Header Style)
        if (slideIndex) {
            slide.addText(`SLIDE ${slideIndex}`, {
                x: 0, y: 0.2, w: '100%', h: 0.3,
                align: "center", fontSize: 9, color: "3B82F6", // blue-500
                bold: true, letterSpacing: 3, fontFace: "Arial Black"
            });
            slide.addShape(pres.ShapeType.line, {
                x: 4.6, y: 0.45, w: 0.8, h: 0,
                line: { color: "3B82F6", width: 1, transparency: 70 }
            });
        }

        // Title
        slide.addText(slideTitle, {
            x: 0.5, y: 0.4, w: 9.0, h: 1.0,
            align: "center", fontSize: 36, bold: true, color: "FFFFFF",
            fontFace: "Pretendard, Malgun Gothic, Arial",
            fit: "shrink", wrap: true
        });

        slide.addShape(pres.ShapeType.line, {
            x: 4.0, y: 1.4, w: 2.0, h: 0,
            line: { color: "3B82F6", width: 3 } // blue-500
        });

        // Process bullets into individual cards/shapes, or centered text
        // Centered Text Bullets (simulating data emphasis)
        slide.addText(bullets.join('\n\n'), {
            x: 1.0, y: 1.6, w: 8.0, h: 3.8,
            align: "center", fontSize: 22, bold: true, color: "F8FAFC", // slate-50
            valign: "top", fontFace: "Pretendard, Malgun Gothic, Arial",
            lineSpacing: 36,
            fit: "shrink", wrap: true
        });
    }

    // Bottom Contrast Accent for both layouts
    slide.addShape(pres.ShapeType.rect, {
        x: 0, y: 5.5, w: '100%', h: 0.1,
        fill: { color: "3B82F6" }
    });
};

/**
 * AI가 생성한 텍스트를 분석하여 PPTX 파일로 생성하고 다운로드합니다.
 */
export const exportToPPTX = async (content: string, title: string = "Presentation", slideImages?: Record<number, string>) => {
    const pres = new pptxgen();
    pres.layout = "LAYOUT_16x9";
    pres.author = "Prompt Architect Engine";
    pres.company = "Antigravity AI";
    pres.title = title;

    // Define Premium Color Palette (Quantum Excellence Style)
    const bgColor = "042F2E"; // Deep Forest Green
    const goldColor = "FBBF24"; // Premium Gold
    const accentColor = "065F46"; // Emerald Accent
    const textColor = "FFFFFF"; // White
    const subTextColor = "FBBF24"; // Gold for highlights

    try {
        // [NEW] Boundary Aware Extraction
        let cleanContent = content;
        const startTag = "[START_PPT_CONTENT]";
        const endTag = "[END_PPT_CONTENT]";

        if (content.includes(startTag)) {
            // Take the content between tags
            cleanContent = content.split(startTag)[1].split(endTag)[0].trim();
        }

        // Parse segments starting with "# ", "## ", or custom "Slide X" headers
        const sections = cleanContent.split(/(?=^# |^## |^Slide\s*\d+|^Page\s*\d+|^슬라이드\s*\d+)/mi).filter(s => s.trim());

        sections.forEach((section, index) => {
            const lines = section.trim().split('\n');
            let slideTitle = lines[0].replace(/^#+ /, '').trim();

            // [SYNC] Strip meta-prefixes aggressively
            slideTitle = slideTitle.replace(/^(Slide|슬라이드|Page|페이지|주제|Topic)\s*\d+[:\]\-\s]*/i, '').trim();
            slideTitle = slideTitle.replace(/^제\s*\d+\s*(장|절|슬라이드)[:\]\-\s]*/i, '').trim();
            if (slideTitle.startsWith('제목:')) slideTitle = slideTitle.replace('제목:', '').trim();

            // [NEW] Strip bracketed meta-tags from title
            slideTitle = slideTitle.replace(/\[.*?\]/g, '').trim();

            const bullets = lines.slice(1)
                .map(l => l.trim())
                .filter(l => /^[*-•]/.test(l) || /^\d+\./.test(l))
                .map(l => {
                    let bulletText = l.replace(/^([-*•]|\d+\.)\s+/, '').trim();
                    // [NEW] Strip bracketed meta-tags from bullets
                    return bulletText.replace(/\[.*?\]/g, '').trim();
                })
                .filter(l => l.length > 0);

            const backgroundImagePath = slideImages ? slideImages[index] : undefined;

            if (bullets.length > 4) {
                let chunkCount = 1;
                for (let i = 0; i < bullets.length; i += 4) {
                    const chunk = bullets.slice(i, i + 4);
                    addContentSlide(pres, `${slideTitle} ${chunkCount}`, chunk, bgColor, goldColor, accentColor, textColor, backgroundImagePath, index + 1);
                    chunkCount++;
                }
            } else if (slideTitle || bullets.length > 0) {
                if (index === 0) {
                    let titleImg = backgroundImagePath || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop';
                    addTitleSlide(pres, slideTitle, bullets, bgColor, goldColor, textColor, subTextColor, titleImg);
                } else {
                    addContentSlide(pres, slideTitle, bullets, bgColor, goldColor, accentColor, textColor, backgroundImagePath, index + 1);
                }
            }
        });

        const safeName = title.replace(/[^a-z0-9가-힣]/gi, '_').substring(0, 30) || "Presentation";
        await pres.writeFile({ fileName: `Prompt_Architect_${safeName}.pptx` });
        return true;
    } catch (error) {
        console.error("PPTX Export Error:", error);
        throw error;
    }
};
