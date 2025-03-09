import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Star } from 'lucide-react';

interface ReviewFormProps {
  productId: number;
  onSuccess?: () => void;
}

const formSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(3, 'Comment must be at least 3 characters'),
});

const ReviewForm = ({ productId, onSuccess }: ReviewFormProps) => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [hoveredStar, setHoveredStar] = useState(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rating: 0,
      comment: '',
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const res = await apiRequest('POST', `/api/products/${productId}/reviews`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}/reviews`] });
      toast({
        title: 'Review submitted',
        description: 'Thank you for your feedback!',
      });
      form.reset();
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to submit review',
        description: error.message || 'Please try again later',
        variant: 'destructive',
      });
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg text-center">
        <p className="text-gray-600 mb-2">Please sign in to leave a review</p>
        <Button asChild variant="outline">
          <a href="/login">Sign In</a>
        </Button>
      </div>
    );
  }

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rating</FormLabel>
              <FormControl>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="p-1"
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      onClick={() => field.onChange(star)}
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= (hoveredStar || field.value)
                            ? 'fill-accent text-accent'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Review</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Share your thoughts about this product..."
                  {...field}
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Submitting...' : 'Submit Review'}
        </Button>
      </form>
    </Form>
  );
};

export default ReviewForm;
