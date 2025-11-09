#!/bin/bash

# Helper script to identify files with hardcoded dimension values
# Usage: bash scripts/check-hardcoded-values.sh [directory]
# Example: bash scripts/check-hardcoded-values.sh components

TARGET_DIR="${1:-.}"

echo "🔍 Scanning for hardcoded dimension values in: $TARGET_DIR"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Count files by pattern
FONT_COUNT=$(find "$TARGET_DIR" -name "*.tsx" -o -name "*.ts" | xargs grep -l "fontSize: [0-9]" 2>/dev/null | wc -l)
DIMENSION_COUNT=$(find "$TARGET_DIR" -name "*.tsx" -o -name "*.ts" | xargs grep -l "width: [0-9]\|height: [0-9]" 2>/dev/null | wc -l)

echo "📊 Summary:"
echo "  Files with hardcoded font sizes: $FONT_COUNT"
echo "  Files with hardcoded dimensions: $DIMENSION_COUNT"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Show files with most occurrences
echo "📁 Top 10 files with most hardcoded values:"
echo ""

find "$TARGET_DIR" -name "*.tsx" -o -name "*.ts" | while read file; do
    # Skip node_modules and test files
    if [[ "$file" == *"node_modules"* ]] || [[ "$file" == *".test."* ]]; then
        continue
    fi
    
    # Count occurrences
    count=$(grep -c "fontSize: [0-9]\|width: [0-9]\|height: [0-9]\|padding: [0-9]\|margin: [0-9]" "$file" 2>/dev/null || echo 0)
    
    if [ "$count" -gt 0 ]; then
        echo "$count $file"
    fi
done | sort -rn | head -10 | while read count file; do
    echo "  [$count values] $(basename $file)"
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check a specific file if provided as second argument
if [ -n "$2" ]; then
    echo "🔎 Detailed view of: $2"
    echo ""
    grep -n "fontSize: [0-9]\|width: [0-9]\|height: [0-9]\|padding: [0-9]\|margin: [0-9]" "$2" || echo "  No hardcoded values found!"
    echo ""
fi

echo "💡 Tips:"
echo "  • Use 'RFValue()' for font sizes"
echo "  • Use 'scale()' for widths and horizontal spacing"
echo "  • Use 'verticalScale()' for heights and vertical spacing"
echo "  • Use 'moderateScale()' for border radius"
echo ""
echo "📚 See: OPTION_A_WORKFLOW.md for step-by-step guide"


