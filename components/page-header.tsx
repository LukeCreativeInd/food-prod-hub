type PageHeaderProps = {
  title: string;
  description: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="border-b border-slate-200 bg-white/90 px-5 py-6 shadow-sm backdrop-blur md:px-8 md:py-7">
      <p className="text-sm font-semibold text-clean-green-700">
        Clean Eats Hub
      </p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
        {title}
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
        {description}
      </p>
    </div>
  );
}
