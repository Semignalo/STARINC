<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Testimonial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class TestimonialController extends Controller
{
    /** Public: active testimonials ordered by sort_order */
    public function index()
    {
        $version = (int) Cache::get('testimonials:version', 1);
        $testimonials = Cache::remember(
            "testimonials:public:v{$version}",
            now()->addMinutes(10),
            fn () => Testimonial::where('is_active', true)
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get()
                ->toArray(),
        );
        return response()->json($testimonials);
    }

    private function bustCache(): void
    {
        Cache::increment('testimonials:version');
    }

    /** Admin: all testimonials */
    public function adminIndex()
    {
        return response()->json(
            Testimonial::orderBy('sort_order')->orderBy('id')->get()
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'       => 'required|string|max:100',
            'location'   => 'nullable|string|max:100',
            'product'    => 'nullable|string|max:150',
            'text'       => 'required|string|max:500',
            'rating'     => 'required|integer|min:1|max:5',
            'is_active'  => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        $t = Testimonial::create($data);
        $this->bustCache();
        return response()->json($t, 201);
    }

    public function update(Request $request, $id)
    {
        $t = Testimonial::findOrFail($id);

        $data = $request->validate([
            'name'       => 'sometimes|required|string|max:100',
            'location'   => 'nullable|string|max:100',
            'product'    => 'nullable|string|max:150',
            'text'       => 'sometimes|required|string|max:500',
            'rating'     => 'sometimes|required|integer|min:1|max:5',
            'is_active'  => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        $t->update($data);
        $this->bustCache();
        return response()->json($t);
    }

    public function destroy($id)
    {
        Testimonial::findOrFail($id)->delete();
        $this->bustCache();
        return response()->json(['message' => 'Deleted']);
    }

    /** Reorder: accepts array of {id, sort_order} */
    public function reorder(Request $request)
    {
        $request->validate([
            'items'              => 'required|array',
            'items.*.id'         => 'required|integer|exists:testimonials,id',
            'items.*.sort_order' => 'required|integer|min:0',
        ]);

        foreach ($request->items as $item) {
            Testimonial::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        $this->bustCache();
        return response()->json(['message' => 'Reordered']);
    }
}
