declare const Deno: { env: {get(name:string): string | undefined}; serve(handler:(req:Request)=>Response | Promise<Response>):void };
declare module 'npm:stripe@14.25.0' { import Stripe from 'stripe'; export default Stripe; }
