import Button from "./Button";

export default function AddItemForm() {
    return (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Add New Item</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">List your item to start earning in minutes.</p>
            </div>

            <form className="grid gap-4 sm:grid-cols-2">
                <label className="sm:col-span-2">
                    <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Title</span>
                    <input
                        type="text"
                        placeholder="Sony A7 IV Camera"
                        className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />
                </label>

                <label className="sm:col-span-2">
                    <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Description</span>
                    <textarea
                        rows={4}
                        placeholder="Describe your item condition, accessories, and best use case."
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />
                </label>

                <label>
                    <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Price / day</span>
                    <input
                        type="number"
                        placeholder="49"
                        className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />
                </label>

                <label>
                    <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Category</span>
                    <select className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
                        <option>Cameras</option>
                        <option>Gaming</option>
                        <option>Audio</option>
                        <option>Tools</option>
                    </select>
                </label>

                <label className="sm:col-span-2">
                    <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Image upload</span>
                    <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
                        Drag image here or click to upload
                    </div>
                </label>

                <div className="sm:col-span-2 flex justify-end">
                    <Button className="px-6">Publish Item</Button>
                </div>
            </form>
        </section>
    );
}