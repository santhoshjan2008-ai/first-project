import ModelCard from './ModelCard';
import EmptyState from './EmptyState';

export default function ModelGrid({ models, onOpen, onRename, onDelete, onExport }) {
  if (!models || models.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {models.map((model) => (
        <ModelCard
          key={model.id}
          model={model}
          onOpen={onOpen}
          onRename={onRename}
          onDelete={onDelete}
          onExport={onExport}
        />
      ))}
    </div>
  );
}
