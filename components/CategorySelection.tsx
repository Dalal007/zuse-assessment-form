import { PrimaryCategory } from "@/types/assessment";

interface CategorySelectionProps {
  selectedCategories: PrimaryCategory[];
  onCategoryToggle: (category: PrimaryCategory) => void;
  onContinue: () => void;
}

const categories: PrimaryCategory[] = [
  "Background and experience",
  "Technical or role-specific skills",
  "Soft skills and ways of working",
  "Culture and values alignment",
  "Motivation and career goals",
  "Practical details and deal breakers",
];

export default function CategorySelection({
  selectedCategories,
  onCategoryToggle,
  onContinue,
}: CategorySelectionProps) {
  const canContinue = selectedCategories.length > 0;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Jabri RoleFit Assessment Builder
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Select the categories you want to include in your assessment. You can select one or more categories.
      </p>

      <div className="space-y-4 mb-8">
        {categories.map((category) => {
          const isSelected = selectedCategories.includes(category);
          return (
            <label
              key={category}
              className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                isSelected
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onCategoryToggle(category)}
                className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="ml-3 text-gray-900 dark:text-white font-medium">
                {category}
              </span>
            </label>
          );
        })}
      </div>

      <button
        onClick={onContinue}
        disabled={!canContinue}
        className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
          canContinue
            ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-300"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        Continue to Assessment
      </button>
    </div>
  );
}

