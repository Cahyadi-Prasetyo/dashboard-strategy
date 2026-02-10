export default defineAppConfig({
  ui: {
    colorMode: false,
    colors: {
      primary: "primary",
      // secondary: "lightblue",
      neutral: "slate",
      error: "red",
      light: "white",
    },

    button: {
      defaultVariants: {
        color: "primary",
      },
      slots: {
        base: "rounded-lg font-semibold",
      },
    },
    toast: {
      slots: {
        root: "bg-white ring-1 ring-gray-200 shadow-xl p-4",
        title: "text-gray-900 font-bold",
        description: "text-gray-600",
      },
    },
    card: {
      slots: {
        root: "rounded-4xl shadow-sm border-none",
        body: "p-4 sm:p-6",
      },
    },
    table: {
      slots: {
        thead: "bg-primary/10",
        th: "text-primary font-bold",
      },
    },
    skeleton: {
      base: 'animate-pulse rounded-md bg-elevated'
    }
  },
});
