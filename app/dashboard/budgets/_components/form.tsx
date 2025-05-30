// // components/budgets/budget-form.tsx (дуже спрощений приклад)
// "use client";

// import { useState, useEffect } from "react";
// import { useForm, useFieldArray } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// // import { upsertBudget } from "@/app/actions/budget-actions";
// // Припустимо, у вас є компонент Toast, наприклад, з react-hot-toast або shadcn/ui
// import { toast } from "sonner"; // Або інша бібліотека

// // Схема повинна відповідати тій, що на бекенді
// const budgetFormSchema = z.object({
//   totalAmount: z.coerce.number().positive("Загальна сума має бути позитивною"),
//   categoryBudgets: z.array(
//     z.object({
//       categoryId: z.string(),
//       categoryName: z.string(), // Для відображення
//       amount: z.coerce.number().min(0, "Сума не може бути відʼємною"),
//     })
//   ),
// });

// type BudgetFormValues = z.infer<typeof budgetFormSchema>;

// interface Category {
//   id: string;
//   name: string;
// }

// interface BudgetData {
//   id?: string;
//   totalAmount: number | string; // Може бути Decimal з Prisma
//   categoryBudgets: Array<{
//     categoryId: string;
//     amount: number | string;
//     category?: Category;
//   }>;
// }

// interface BudgetFormProps {
//   categories: Category[];
//   initialData: BudgetData | null;
//   currentMonth: number;
//   currentYear: number;
// }

// export function BudgetForm({
//   categories,
//   initialData,
//   currentMonth,
//   currentYear,
// }: BudgetFormProps) {
//   const [isPending, setIsPending] = useState(false);

//   const defaultValues: BudgetFormValues = {
//     totalAmount: initialData ? Number(initialData.totalAmount) : 0,
//     categoryBudgets: categories.data.map((cat) => {
//       const existingBudget = initialData?.categoryBudgets.find(
//         (cb) => cb.categoryId === cat.id
//       );
//       return {
//         categoryId: cat.id,
//         categoryName: cat.name,
//         amount: existingBudget ? Number(existingBudget.amount) : 0,
//       };
//     }),
//   };

//   const {
//     register,
//     handleSubmit,
//     control,
//     formState: { errors },
//     reset,
//   } = useForm<BudgetFormValues>({
//     resolver: zodResolver(budgetFormSchema),
//     defaultValues,
//   });

//   const { fields } = useFieldArray({
//     control,
//     name: "categoryBudgets",
//   });

//   useEffect(() => {
//     // Оновлення форми, якщо initialData або categories змінюються
//     reset({
//       totalAmount: initialData ? Number(initialData.totalAmount) : 0,
//       categoryBudgets: categories.data.map((cat) => {
//         const existingBudget = initialData?.categoryBudgets.find(
//           (cb) => cb.categoryId === cat.id
//         );
//         return {
//           categoryId: cat.id,
//           categoryName: cat.name,
//           amount: existingBudget ? Number(existingBudget.amount) : 0,
//         };
//       }),
//     });
//   }, [initialData, categories, reset]);

//   const onSubmit = async (data: BudgetFormValues) => {
//     setIsPending(true);
//     const result = await upsertBudget({
//       month: currentMonth,
//       year: currentYear,
//       totalAmount: data.totalAmount,
//       categoryBudgets: data.categoryBudgets.map((cb) => ({
//         categoryId: cb.categoryId,
//         amount: cb.amount,
//       })),
//     });

//     if (result.error) {
//       toast.error(result.error);
//     } else {
//       toast.success(result.success);
//     }
//     setIsPending(false);
//   };

//   return (
//     <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//       <div>
//         <label htmlFor="totalAmount">Загальний бюджет на місяць:</label>
//         <input type="number" id="totalAmount" {...register("totalAmount")} />
//         {errors.totalAmount && (
//           <p className="text-red-500">{errors.totalAmount.message}</p>
//         )}
//       </div>

//       <h3>Бюджети по категоріях:</h3>
//       {fields.map((field, index) => (
//         <div key={field.id}>
//           <label htmlFor={`categoryBudgets.${index}.amount`}>
//             {field.categoryName}:
//           </label>
//           <input
//             type="number"
//             {...register(`categoryBudgets.${index}.amount`)}
//           />
//           {/* Не забудьте передати categoryId, хоча воно не редагується */}
//           <input
//             type="hidden"
//             {...register(`categoryBudgets.${index}.categoryId`)}
//           />
//           {errors.categoryBudgets?.[index]?.amount && (
//             <p className="text-red-500">
//               {errors.categoryBudgets[index]?.amount?.message}
//             </p>
//           )}
//         </div>
//       ))}

//       <button type="submit" disabled={isPending}>
//         {isPending ? "Збереження..." : "Зберегти бюджет"}
//       </button>
//     </form>
//   );
// }
