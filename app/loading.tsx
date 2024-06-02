import Loader from "./components/loader"

export default function loadingPage() {
    return (
        <div id="loader-wrapper" className="w-full h-svh flex justify-center items-center">
            <Loader />
        </div>

    )
}