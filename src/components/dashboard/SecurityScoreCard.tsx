import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SecurityScoreCardProps {
  grade: 'A' | 'B' | 'C' | 'D' | 'F' | '-';
  score: number;
  label?: string;
}

const gradeColors = {
  'A': 'text-success border-success/30 bg-success/10',
  'B': 'text-success/80 border-success/20 bg-success/5',
  'C': 'text-warning border-warning/30 bg-warning/10',
  'D': 'text-severity-high border-severity-high/30 bg-severity-high/10',
  'F': 'text-danger border-danger/30 bg-danger/10',
  '-': 'text-muted-foreground border-border bg-muted/10',
};

const gradeGlow = {
  'A': 'glow-success',
  'B': 'glow-success',
  'C': '',
  'D': '',
  'F': 'glow-danger',
  '-': '',
};

export function SecurityScoreCard({ grade, score, label = "Security Score" }: SecurityScoreCardProps) {
  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div 
            className={cn(
              "flex h-16 w-16 items-center justify-center rounded-lg border-2 text-3xl font-bold transition-all",
              gradeColors[grade],
              gradeGlow[grade]
            )}
          >
            {grade}
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">{score}/100</div>
            <div className="text-sm text-muted-foreground">
              {grade === '-' ? 'No scan data' : 
               grade === 'A' ? 'Excellent' :
               grade === 'B' ? 'Good' :
               grade === 'C' ? 'Fair' :
               grade === 'D' ? 'Poor' : 'Critical'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
