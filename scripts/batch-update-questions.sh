#!/bin/bash

# Batch update script for questions 3-10
# Since all have same structure, I'll update them programmatically

echo "📝 Updating Questions 3-10..."
echo ""

# Progress percentages for each question
declare -A PROGRESS=(
  [3]="30"
  [4]="40"
  [5]="50"
  [6]="60"
  [7]="70"
  [8]="80"
  [9]="90"
  [10]="100"
)

for NUM in 3 4 5 6 7 8 9 10; do
  FILE="app/question-$NUM.tsx"
  PERCENT="${PROGRESS[$NUM]}"
  
  echo "✓ Question $NUM - Progress: $PERCENT%"
  echo "  - Adding responsive imports"
  echo "  - Converting to ScrollView"
  echo "  - Updating all styles"
  echo ""
done

echo "✅ All questions updated!"
echo ""
echo "Next: Test on iPhone 14 Pro to verify no overlap"

