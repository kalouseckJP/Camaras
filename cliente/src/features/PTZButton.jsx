import { useRef } from "react";

export default function PTZButton(){

	const intervalRef = useRef(null);

	function stop() {
		clearInterval(intervalRef.current);
		intervalRef.current = null;
	};

	function moveUp(){
		if (intervalRef.current) return;
		intervalRef.current = setInterval(() => {
			console.log('Moviendo Arriba')
		}, 200);
	}

	function moveRight(){
		if (intervalRef.current) return;
		intervalRef.current = setInterval(() => {
			console.log('Moviendo Derecha')
		}, 200);
	}

	function moveDown(){
		if (intervalRef.current) return;
		intervalRef.current = setInterval(() => {
			console.log('Moviendo Abajo')
		}, 200);
	}

	function moveLeft(){
		if (intervalRef.current) return;
		intervalRef.current = setInterval(() => {
			console.log('Moviendo Izquierda')
		}, 200);
	}

	function moveLeft(){
		if (intervalRef.current) return;
		intervalRef.current = setInterval(() => {
			console.log('Moviendo Izquierda')
		}, 200);
	}

		function moveCenter(){
			console.log('Moviendo Centro')
	}

	return (
		<div className="border black:border-white rounded-4xl m-2 grid grid-cols-3 grid-rows-3 aspect-square">

			<button type="button" 
				className="font-bold p-2 inline-flex items-center justify-center col-start-2 col-end-2 row-start-1 row-end-1 hover:bg-amber-300 hover:cursor-pointer rounded-2xl hover:text-black"
					onPointerDown={moveUp}
					onPointerUp={stop}
					onPointerLeave={stop}
					onPointerCancel={stop}
					>
				<span>U</span>
			</button>
			<button type="button"
				className="font-bold p-2 inline-flex items-center justify-center col-start-3 col-end-3 row-start-2 row-end-2 hover:bg-amber-300 hover:cursor-pointer rounded-2xl hover:text-black"
					onPointerDown={moveRight}
					onPointerUp={stop}
					onPointerLeave={stop}
					onPointerCancel={stop}
					>
				<span>R</span>
			</button>
			<button type="button"
				className="font-bold p-2 inline-flex items-center justify-center col-start-2 col-end-2 row-start-3 row-end-3 hover:bg-amber-300 hover:cursor-pointer rounded-2xl hover:text-black"
					onPointerDown={moveDown}
					onPointerUp={stop}
					onPointerLeave={stop}
					onPointerCancel={stop}
					>
				<span>D</span>
			</button>
			<button type="button"
				className="font-bold p-2 inline-flex items-center justify-center col-start-1 col-end-1 row-start-2 row-end-2 hover:bg-amber-300 hover:cursor-pointer rounded-2xl hover:text-black"
					onPointerDown={moveLeft}
					onPointerUp={stop}
					onPointerLeave={stop}
					onPointerCancel={stop}>
				<span>L</span>
			</button>
				<button type="button"
					className="font-bold p-2 inline-flex items-center justify-center col-start-2 col-end-2 row-start-2 row-end-2 hover:bg-amber-300 hover:cursor-pointer rounded-2xl hover:text-black"
						onPointerDown={moveCenter}>
					<span>O</span>
				</button>

		</div>
	)
}
