
import MenuPage from "@/modules/Menu/MenuPage";

type Props = {
    params: Promise<{
        id: string;
    }>;
};

export default async function Page({ params }: Props) {
    const { id } = await params;
    // console.log(data)
    return <MenuPage id={id} />;
}
