import { Badge } from '@databricks/appkit-ui/react';
import type { ReferenceClassification } from '../content/documentation';

const classificationVariants: Record<ReferenceClassification, 'default' | 'outline' | 'secondary'> = {
  'Databricks primitive': 'default',
  'Example implementation': 'secondary',
  'Metric Hub default': 'outline',
  'Environment binding': 'secondary',
  'Replace for your app': 'outline',
};

export function ReferenceClassificationBadges({
  classifications,
}: {
  classifications: readonly ReferenceClassification[];
}) {
  return (
    <div className="flex flex-wrap gap-1.5" aria-label="Reference classifications">
      {classifications.map((classification) => (
        <Badge key={classification} variant={classificationVariants[classification]}>
          {classification}
        </Badge>
      ))}
    </div>
  );
}
