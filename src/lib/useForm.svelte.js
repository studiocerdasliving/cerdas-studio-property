import { apiFetch } from './api.js';

/**
 * @template {Record<string, any>} T
 * @param {T} initialData
 * @returns {{ data: T, errors: Record<string, string>, processing: boolean, submit: Function, post: Function, put: Function, delete: Function }}
 */
export function useForm(initialData = {}) {
    let state = $state({
        data: { ...initialData },
        errors: {},
        processing: false,
    });

    const form = {
        get data() { return state.data; },
        set data(v) { state.data = v; },
        get errors() { return state.errors; },
        set errors(v) { state.errors = v; },
        get processing() { return state.processing; },
        set processing(v) { state.processing = v; },

        async submit(method, urlString, options = {}) {
            state.processing = true;
            state.errors = {};
            try {
                let body;
                let headers = {};
                
                if (options.forceFormData) {
                    body = new FormData();
                    for (const key in state.data) {
                        const val = state.data[key];
                        if (val instanceof File) {
                            body.append(key, val);
                        } else if (Array.isArray(val)) {
                            val.forEach(v => body.append(`${key}[]`, v));
                        } else if (val !== null && val !== undefined) {
                            body.append(key, val);
                        }
                    }
                } else {
                    body = JSON.stringify(state.data);
                    headers['Content-Type'] = 'application/json';
                }

                // If URL has ?_method=PUT, make sure fetch uses POST but passes it along
                // apiFetch handles method correctly based on standard fetch.
                const res = await apiFetch(urlString, {
                    method: method === 'PUT' && options.forceFormData ? 'POST' : method,
                    headers: Object.keys(headers).length ? headers : undefined,
                    body
                });
                
                if (options.onSuccess) {
                    options.onSuccess(res);
                } else if (res && res.redirect) {
                    window.location.href = res.redirect;
                } else if (!options.preserveScroll) {
                    window.location.reload();
                }

            } catch (err) {
                if (err.errors) {
                    state.errors = err.errors;
                } else {
                    alert(err.message || 'Terjadi kesalahan.');
                }
                if (options.onError) options.onError(state.errors);
            } finally {
                state.processing = false;
            }
        },

        post(urlString, options = {}) {
            return form.submit('POST', urlString, options);
        },
        put(urlString, options = {}) {
            return form.submit('PUT', urlString, options);
        },
        delete(urlString, options = {}) {
            return form.submit('DELETE', urlString, options);
        }
    };

    return form;
}
