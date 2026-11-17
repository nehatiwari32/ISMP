import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../redux/store";
import { getOrganization } from "../redux/slices/profileSlice";

export interface OrgItem {
  _id: string;
  name: string;
  [key: string]: any;
}

export default function useOrganizationSearch(type: "school" | "college" | "company") {
  const dispatch = useDispatch<AppDispatch>();

  const [search, setSearch] = useState<string>("");
  const [list, setList] = useState<OrgItem[]>([]);
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (search.trim().length >= 2) {
        fetchList();
      } else {
        setList([]);
        setVisible(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [search]);

  const fetchList = async () => {
    try {
      const res: OrgItem[] = await dispatch(
        getOrganization({ type, search })
      ).unwrap();

      setList(res || []);
      setVisible(true);
    } catch (err) {
      setList([]);
      setVisible(false);
    }
  };

  return { search, setSearch, list, visible, setVisible };
}
